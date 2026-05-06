import { useState, useCallback } from 'react';
import { ALL_LEVELS, difficultyRules } from '../core/difficulty-rules';
import { validateQuizCount, validateCopyCount } from '../core/validation';
import type { QuizConfig, DifficultyLevel, QuizType } from '../types';
import { QUIZ_TYPE_LABELS } from '../types';

const ALL_QUIZ_TYPES: QuizType[] = ['direct', 'fillBlank', 'vertical'];

export interface ConfigPanelProps {
  onConfigChange: (config: QuizConfig) => void;
  onDownloadPDF: () => void;
  onPrint: () => void;
  hasQuizzes: boolean;
}

interface LevelState {
  checked: boolean;
  count: string;       // raw input string
  countError: string;  // validation error
}

export default function ConfigPanel({ onConfigChange, onDownloadPDF, onPrint, hasQuizzes }: ConfigPanelProps) {
  const [levels, setLevels] = useState<Record<DifficultyLevel, LevelState>>(() => {
    const init = {} as Record<DifficultyLevel, LevelState>;
    for (const l of ALL_LEVELS) {
      init[l] = { checked: false, count: '50', countError: '' };
    }
    return init;
  });

  const [copyCountStr, setCopyCountStr] = useState('1');
  const [copyCountError, setCopyCountError] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<QuizType[]>(['direct']);

  const buildAndNotify = useCallback(
    (nextLevels: Record<DifficultyLevel, LevelState>, nextCopyStr: string, types?: QuizType[]) => {
      const copyVal = Number(nextCopyStr);
      const copyResult = validateCopyCount(copyVal);

      const selections: QuizConfig['selections'] = [];
      let hasValidationError = false;

      for (const l of ALL_LEVELS) {
        const s = nextLevels[l];
        if (!s.checked) continue;
        const countVal = Number(s.count);
        const countResult = validateQuizCount(countVal);
        if (!countResult.valid) {
          hasValidationError = true;
          continue;
        }
        selections.push({ difficulty: l, count: countVal });
      }

      if (hasValidationError || !copyResult.valid) return;

      onConfigChange({ selections, copyCount: copyVal, quizTypes: types || selectedTypes });
    },
    [onConfigChange, selectedTypes],
  );

  const handleCheckToggle = (level: DifficultyLevel) => {
    setLevels((prev) => {
      const cur = prev[level];
      const next = {
        ...prev,
        [level]: cur.checked
          ? { checked: false, count: '50', countError: '' }
          : { checked: true, count: '50', countError: '' },
      };
      buildAndNotify(next, copyCountStr);
      return next;
    });
  };

  const handleCountChange = (level: DifficultyLevel, value: string) => {
    setLevels((prev) => {
      const numVal = Number(value);
      const result = validateQuizCount(numVal);
      const next = {
        ...prev,
        [level]: { ...prev[level], count: value, countError: result.valid ? '' : (result.error ?? '') },
      };
      buildAndNotify(next, copyCountStr);
      return next;
    });
  };

  const handleCopyCountChange = (value: string) => {
    setCopyCountStr(value);
    const numVal = Number(value);
    const result = validateCopyCount(numVal);
    setCopyCountError(result.valid ? '' : (result.error ?? ''));
    setLevels((prev) => {
      buildAndNotify(prev, value);
      return prev;
    });
  };

  const anyChecked = ALL_LEVELS.some((l) => levels[l].checked);
  const downloadDisabled = !anyChecked || !hasQuizzes;

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>配置面板</h3>

      <div style={styles.levelList}>
        {ALL_LEVELS.map((level) => {
          const rule = difficultyRules[level];
          const state = levels[level];
          return (
            <div key={level} style={styles.levelRow}>
              <label style={styles.checkLabel}>
                <input
                  type="checkbox"
                  checked={state.checked}
                  onChange={() => handleCheckToggle(level)}
                  data-testid={`check-${level}`}
                />
                <span style={styles.levelText}>
                  {level.toUpperCase()}. {rule.label}
                </span>
              </label>
              {state.checked && (
                <div style={styles.countRow}>
                  <span style={styles.countLabel}>题数：</span>
                  <input
                    type="number"
                    value={state.count}
                    onChange={(e) => handleCountChange(level, e.target.value)}
                    style={styles.countInput}
                    data-testid={`count-${level}`}
                    min={1}
                    max={200}
                  />
                  {state.countError && (
                    <span style={styles.errorText} data-testid={`error-${level}`}>
                      {state.countError}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={styles.typeSection}>
        <span style={styles.typeSectionLabel}>题型选择：</span>
        {ALL_QUIZ_TYPES.map((type) => (
          <label key={type} style={styles.typeCheckLabel}>
            <input
              type="checkbox"
              checked={selectedTypes.includes(type)}
              onChange={() => {
                setSelectedTypes((prev) => {
                  const next = prev.includes(type)
                    ? prev.filter(t => t !== type)
                    : [...prev, type];
                  const result = next.length > 0 ? next : ['direct' as QuizType];
                  buildAndNotify(levels, copyCountStr, result);
                  return result;
                });
              }}
              data-testid={`type-${type}`}
            />
            <span style={styles.levelText}>{QUIZ_TYPE_LABELS[type]}</span>
          </label>
        ))}
      </div>

      <div style={styles.copySection}>
        <label style={styles.copyLabel}>
          生成份数：
          <input
            type="number"
            value={copyCountStr}
            onChange={(e) => handleCopyCountChange(e.target.value)}
            style={styles.countInput}
            data-testid="copy-count"
            min={1}
            max={10}
          />
        </label>
        {copyCountError && (
          <span style={styles.errorText} data-testid="error-copy-count">
            {copyCountError}
          </span>
        )}
      </div>

      <div style={styles.downloadSection}>
        <button
          onClick={onDownloadPDF}
          disabled={downloadDisabled}
          style={{
            ...styles.downloadBtn,
            ...(downloadDisabled ? styles.downloadBtnDisabled : {}),
          }}
          data-testid="download-btn"
        >
          下载PDF
        </button>
        <button
          onClick={onPrint}
          disabled={downloadDisabled}
          style={{
            ...styles.printBtn,
            ...(downloadDisabled ? styles.downloadBtnDisabled : {}),
          }}
          data-testid="print-btn"
        >
          打印预览
        </button>
        {!anyChecked && (
          <span style={styles.hintText} data-testid="no-selection-hint">
            请先选择难度类型
          </span>
        )}
      </div>
    </div>
  );
}


const styles: Record<string, React.CSSProperties> = {
  container: {
    width: 300,
    padding: 16,
    borderRight: '1px solid #e0e0e0',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  title: {
    margin: '0 0 12px 0',
    fontSize: 16,
  },
  levelList: {
    flex: 1,
    overflowY: 'auto',
    marginBottom: 12,
  },
  levelRow: {
    marginBottom: 6,
  },
  checkLabel: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    gap: 4,
  },
  levelText: {
    fontSize: 13,
  },
  countRow: {
    display: 'flex',
    alignItems: 'center',
    marginLeft: 22,
    marginTop: 2,
    gap: 4,
  },
  countLabel: {
    fontSize: 12,
    color: '#666',
  },
  countInput: {
    width: 60,
    padding: '2px 4px',
    fontSize: 13,
  },
  errorText: {
    color: 'red',
    fontSize: 11,
  },
  typeSection: {
    marginBottom: 12,
    paddingTop: 8,
    borderTop: '1px solid #e0e0e0',
  },
  typeSectionLabel: {
    fontSize: 13,
    fontWeight: 500,
    display: 'block',
    marginBottom: 4,
  },
  typeCheckLabel: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    gap: 4,
    marginBottom: 2,
  },
  copySection: {
    marginBottom: 12,
    paddingTop: 8,
    borderTop: '1px solid #e0e0e0',
  },
  copyLabel: {
    fontSize: 13,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  downloadSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 6,
  },
  downloadBtn: {
    padding: '8px 20px',
    fontSize: 14,
    backgroundColor: '#1976d2',
    color: '#fff',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
  },
  printBtn: {
    padding: '8px 20px',
    fontSize: 14,
    backgroundColor: '#388e3c',
    color: '#fff',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
  },
  downloadBtnDisabled: {
    backgroundColor: '#bdbdbd',
    cursor: 'not-allowed',
  },
  hintText: {
    color: '#999',
    fontSize: 12,
  },
};
