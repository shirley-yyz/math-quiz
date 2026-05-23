import { useState, useCallback, useRef, useEffect } from 'react';
import ConfigPanel, { type DownloadFormat } from './components/ConfigPanel';
import PreviewArea from './components/PreviewArea';
import { generateQuizzes } from './core/quiz-generator';
import { generatePDF } from './core/pdf-generator';
import { generateWord } from './core/word-generator';
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

  const handleDownload = useCallback(async (format: DownloadFormat) => {
    if (!result) return;
    try {
      if (format === 'pdf') {
        generatePDF(result);
      } else {
        await generateWord(result);
      }
    } catch (e) {
      console.error(e);
      alert(`${format === 'pdf' ? 'PDF' : 'Word'}生成失败，请重试`);
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
          onDownload={handleDownload}
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
