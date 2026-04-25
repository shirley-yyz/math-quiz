import { useState, useCallback, useRef, useEffect } from 'react';
import ConfigPanel from './components/ConfigPanel';
import PreviewArea from './components/PreviewArea';
import { generateQuizzes } from './core/quiz-generator';
import { generatePDF } from './core/pdf-generator';
import type { QuizConfig, GenerationResult } from './types';

const DEBOUNCE_MS = 500;

function App() {
  const [result, setResult] = useState<GenerationResult | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleConfigChange = useCallback((config: QuizConfig) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (config.selections.length === 0) {
        setResult(null);
        return;
      }
      setResult(generateQuizzes(config));
    }, DEBOUNCE_MS);
  }, []);

  const handleDownloadPDF = useCallback(() => {
    if (!result) return;
    try {
      generatePDF(result);
    } catch {
      alert('PDF生成失败，请重试');
    }
  }, [result]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const hasQuizzes = result !== null && result.copies.length > 0 && result.copies[0].quizzes.length > 0;

  return (
    <div style={styles.root}>
      <div className="no-print">
        <ConfigPanel
          onConfigChange={handleConfigChange}
          onDownloadPDF={handleDownloadPDF}
          onPrint={handlePrint}
          hasQuizzes={hasQuizzes}
        />
      </div>
      <PreviewArea result={result} />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    display: 'flex',
    height: '100%',
    width: '100%',
  },
};

export default App;
