import { useState } from 'react';
import type { GenerationResult, Quiz, QuizGroup } from '../types';
import { QUIZ_TYPE_LABELS } from '../types';
import { formatQuiz } from '../core/quiz-formatter';
import { calculatePages, getPageQuizzes } from '../core/pagination';

export interface PreviewAreaProps {
  result: GenerationResult | null;
}

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const MARGIN_MM = 20;
const MARGIN_LR_MM = 15.3;
const COLUMNS = 4;
const FONT_SIZE_PT = 12;
const LINE_HEIGHT_MULT = 3.6;

const SCALE = 2.5;
const pageWidthPx = A4_WIDTH_MM * SCALE;
const pageHeightPx = A4_HEIGHT_MM * SCALE;
const marginTBPx = MARGIN_MM * SCALE;
const marginLRPx = MARGIN_LR_MM * SCALE;
const contentWidthPx = pageWidthPx - marginLRPx * 2;
const colWidthPx = contentWidthPx / COLUMNS;
const fontSizePx = FONT_SIZE_PT * SCALE * 0.352778;
const lineHeightPx = fontSizePx * LINE_HEIGHT_MULT;
const titleFontSizePx = 14 * SCALE * 0.352778;

export default function PreviewArea({ result }: PreviewAreaProps) {
  const [currentCopy, setCurrentCopy] = useState(0);

  if (!result) {
    return (
      <div style={styles.container}>
        <div style={styles.emptyState} data-testid="empty-state">
          请选择难度类型并配置题目数量
        </div>
      </div>
    );
  }

  const copies = result.copies;
  const totalCopies = copies.length;
  const copy = copies[Math.min(currentCopy, totalCopies - 1)];

  return (
    <div style={styles.container}>
      {totalCopies > 1 && (
        <div style={styles.copyNav} data-testid="copy-nav">
          <button
            onClick={() => setCurrentCopy((c) => Math.max(0, c - 1))}
            disabled={currentCopy === 0}
            style={styles.navBtn}
            data-testid="prev-copy"
          >
            上一份
          </button>
          <span style={styles.copyLabel} data-testid="copy-label">
            第{currentCopy + 1}份/共{totalCopies}份
          </span>
          <button
            onClick={() => setCurrentCopy((c) => Math.min(totalCopies - 1, c + 1))}
            disabled={currentCopy >= totalCopies - 1}
            style={styles.navBtn}
            data-testid="next-copy"
          >
            下一份
          </button>
        </div>
      )}

      {result.warnings.length > 0 && (
        <div style={styles.warnings} data-testid="warnings">
          {result.warnings.map((w, i) => (
            <div key={i} style={styles.warningItem}>{w}</div>
          ))}
        </div>
      )}

      <div style={styles.pagesWrapper}>
        <A4PageWithGroups groups={copy.groups} />
      </div>
    </div>
  );
}

/** Render all groups within A4 pages */
function A4PageWithGroups({ groups }: { groups: QuizGroup[] }) {
  return (
    <div style={styles.a4Page} data-testid="a4-page">
      <div style={styles.pageHeader}>
        <span>姓名：______</span>
        <span>用时：______</span>
      </div>

      {groups.map((group, idx) => (
        <div key={idx}>
          {/* Section title */}
          <div style={{
            ...styles.sectionTitle,
            marginTop: idx === 0 ? 0 : lineHeightPx * 2,
          }}>
            {QUIZ_TYPE_LABELS[group.type]}
          </div>

          {/* Quiz grid */}
          <QuizGrid quizzes={group.quizzes} />
        </div>
      ))}
    </div>
  );
}

function QuizGrid({ quizzes }: { quizzes: Quiz[] }) {
  const rows: Quiz[][] = [];
  for (let i = 0; i < quizzes.length; i += COLUMNS) {
    rows.push(quizzes.slice(i, i + COLUMNS));
  }

  return (
    <div style={styles.quizGrid}>
      {rows.map((row, rowIdx) => (
        <div key={rowIdx} style={styles.quizRow}>
          {row.map((quiz, colIdx) => (
            <div key={colIdx} style={styles.quizCell}>
              {formatQuiz(quiz)}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    flex: 1,
    overflow: 'auto',
    backgroundColor: '#f5f5f5',
    padding: 20,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  emptyState: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#999',
    fontSize: 16,
  },
  copyNav: {
    position: 'sticky',
    top: 0,
    zIndex: 10,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '8px 16px',
    backgroundColor: '#fff',
    borderRadius: 4,
    boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
    marginBottom: 16,
  },
  navBtn: { padding: '4px 12px', fontSize: 13, cursor: 'pointer' },
  copyLabel: { fontSize: 14, fontWeight: 500 },
  warnings: { width: pageWidthPx, marginBottom: 12 },
  warningItem: {
    padding: '6px 10px',
    backgroundColor: '#fff3e0',
    color: '#e65100',
    fontSize: 13,
    borderRadius: 4,
    marginBottom: 4,
  },
  pagesWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 20,
  },
  a4Page: {
    width: pageWidthPx,
    minHeight: pageHeightPx,
    backgroundColor: '#fff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    boxSizing: 'border-box',
    paddingTop: marginTBPx,
    paddingBottom: marginTBPx,
    paddingLeft: marginLRPx,
    paddingRight: marginLRPx,
    fontFamily: '"Microsoft YaHei", "微软雅黑", sans-serif',
    fontSize: fontSizePx,
  },
  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: lineHeightPx,
    fontSize: fontSizePx,
  },
  sectionTitle: {
    fontSize: titleFontSizePx,
    fontWeight: 'bold',
    marginBottom: lineHeightPx * 0.5,
  },
  quizGrid: { display: 'flex', flexDirection: 'column' },
  quizRow: {
    display: 'flex',
    lineHeight: `${lineHeightPx}px`,
    height: lineHeightPx,
  },
  quizCell: { width: colWidthPx, whiteSpace: 'nowrap' },
};
