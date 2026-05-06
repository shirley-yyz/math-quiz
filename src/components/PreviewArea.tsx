import { useState } from 'react';
import type { GenerationResult, Quiz, QuizGroup } from '../types';
import { QUIZ_TYPE_LABELS, CHINESE_NUMBERS } from '../types';
import { formatQuiz } from '../core/quiz-formatter';

export interface PreviewAreaProps {
  result: GenerationResult | null;
}

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const MARGIN_MM = 20;
const MARGIN_LR_MM = 15.3;
const COLUMNS = 4;
const FONT_SIZE_PT = 12;
const LINE_HEIGHT_MULT = 3;

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
        <A4PageWithGroups groups={copy.groups || [{ type: 'direct', quizzes: copy.quizzes }]} />
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
          {/* Section title with dynamic numbering */}
          <div style={{
            ...styles.sectionTitle,
            marginTop: idx === 0 ? 0 : lineHeightPx * 1,
          }}>
            {CHINESE_NUMBERS[idx]}、{QUIZ_TYPE_LABELS[group.type]}
          </div>

          {/* Quiz grid */}
          {group.type === 'vertical' ? (
            <VerticalQuizGrid quizzes={group.quizzes} />
          ) : (
            <QuizGrid quizzes={group.quizzes} />
          )}
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

/** 竖式填空题：每道题竖式排列，每行放4道 */
const VERTICAL_COLUMNS = 4;

function VerticalQuizGrid({ quizzes }: { quizzes: Quiz[] }) {
  const rows: Quiz[][] = [];
  for (let i = 0; i < quizzes.length; i += VERTICAL_COLUMNS) {
    rows.push(quizzes.slice(i, i + VERTICAL_COLUMNS));
  }

  return (
    <div style={styles.quizGrid}>
      {rows.map((row, rowIdx) => (
        <div key={rowIdx} style={styles.verticalRow}>
          {row.map((quiz, colIdx) => (
            <VerticalQuizCell key={colIdx} quiz={quiz} />
          ))}
        </div>
      ))}
    </div>
  );
}

/** 单道竖式题渲染：上面横式等式 + 下面竖式 */
function VerticalQuizCell({ quiz }: { quiz: Quiz }) {
  const [a, b] = quiz.operands;
  const op = quiz.operators[0] || '+';
  const result = quiz.answer;
  const blankPos = quiz.blankPosition ?? -1;

  // 横式部分（用□代替空白）
  const displayAH = blankPos === 0 ? '□' : String(a);
  const displayBH = blankPos === 1 ? '□' : String(b);
  const horizontal = `${displayAH} ${op} ${displayBH} = ${result}`;

  // 竖式部分
  const maxDigits = Math.max(String(a).length, String(b).length, String(result).length);
  const displayAV = blankPos === 0 ? '□'.padStart(maxDigits) : String(a).padStart(maxDigits);
  const displayBV = blankPos === 1 ? '□'.padStart(maxDigits) : String(b).padStart(maxDigits);
  const displayResultV = String(result).padStart(maxDigits);
  const line = '—'.repeat(maxDigits + 2);

  return (
    <div style={styles.verticalCell}>
      <div style={styles.verticalHorizontal}>{horizontal}</div>
      <div style={styles.verticalLine}><span style={styles.verticalOp}>&nbsp;&nbsp;</span>{displayAV}</div>
      <div style={styles.verticalLine}><span style={styles.verticalOp}>{op} </span>{displayBV}</div>
      <div style={styles.verticalDivider}>{line}</div>
      <div style={styles.verticalLine}><span style={styles.verticalOp}>&nbsp;&nbsp;</span>{displayResultV}</div>
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
    marginBottom: lineHeightPx * 0.2,
  },
  quizGrid: { display: 'flex', flexDirection: 'column' },
  quizRow: {
    display: 'flex',
    lineHeight: `${lineHeightPx}px`,
    height: lineHeightPx,
  },
  quizCell: { width: colWidthPx, whiteSpace: 'nowrap' },
  verticalRow: {
    display: 'flex',
    marginBottom: lineHeightPx * 0.5,
  },
  verticalCell: {
    width: contentWidthPx / COLUMNS,
    fontFamily: 'monospace, "Microsoft YaHei", "微软雅黑"',
    fontSize: fontSizePx,
    lineHeight: 1.4,
    marginBottom: lineHeightPx * 0.3,
  },
  verticalHorizontal: {
    marginBottom: 4,
    fontFamily: '"Microsoft YaHei", "微软雅黑", sans-serif',
    textAlign: 'left',
  },
  verticalLine: {
    whiteSpace: 'pre',
    textAlign: 'left' as const,
  },
  verticalOp: {
    display: 'inline-block',
    width: '1.2em',
    textAlign: 'left' as const,
  },
  verticalDivider: {
    whiteSpace: 'pre',
    textAlign: 'left' as const,
  },
};
