import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PreviewArea from '../PreviewArea';
import type { GenerationResult, Quiz } from '../../types';

function makeQuiz(operands: number[], operators: ('+' | '-')[], answer: number, difficulty: Quiz['difficulty'] = 'a'): Quiz {
  return { operands, operators, answer, difficulty };
}

function makeResult(quizzes: Quiz[], copies = 1): GenerationResult {
  return {
    copies: Array.from({ length: copies }, (_, i) => ({
      copyIndex: i + 1,
      quizzes: copies === 1 ? quizzes : quizzes.map(q => ({ ...q })),
    })),
    warnings: [],
  };
}

describe('PreviewArea', () => {
  it('shows empty state when result is null', () => {
    render(<PreviewArea result={null} />);
    expect(screen.getByTestId('empty-state')).toHaveTextContent('请选择难度类型并配置题目数量');
  });

  it('renders A4 page with quizzes', () => {
    const quizzes = [makeQuiz([3, 2], ['+'], 5)];
    render(<PreviewArea result={makeResult(quizzes)} />);
    const pages = screen.getAllByTestId('a4-page');
    expect(pages.length).toBe(1);
    expect(pages[0]).toHaveTextContent('3 + 2 = ____');
  });

  it('renders page header with name and time fields', () => {
    const quizzes = [makeQuiz([1, 1], ['+'], 2)];
    render(<PreviewArea result={makeResult(quizzes)} />);
    const page = screen.getByTestId('a4-page');
    expect(page).toHaveTextContent('姓名：______');
    expect(page).toHaveTextContent('用时：______');
  });

  it('does not show copy navigation for single copy', () => {
    const quizzes = [makeQuiz([1, 1], ['+'], 2)];
    render(<PreviewArea result={makeResult(quizzes, 1)} />);
    expect(screen.queryByTestId('copy-nav')).not.toBeInTheDocument();
  });

  it('shows copy navigation for multiple copies', () => {
    const quizzes = [makeQuiz([1, 1], ['+'], 2)];
    render(<PreviewArea result={makeResult(quizzes, 3)} />);
    expect(screen.getByTestId('copy-nav')).toBeInTheDocument();
    expect(screen.getByTestId('copy-label')).toHaveTextContent('第1份/共3份');
  });

  it('navigates between copies with prev/next buttons', () => {
    const quizzes = [makeQuiz([1, 1], ['+'], 2)];
    render(<PreviewArea result={makeResult(quizzes, 3)} />);

    const prevBtn = screen.getByTestId('prev-copy') as HTMLButtonElement;
    const nextBtn = screen.getByTestId('next-copy') as HTMLButtonElement;

    expect(prevBtn.disabled).toBe(true);
    expect(nextBtn.disabled).toBe(false);

    fireEvent.click(nextBtn);
    expect(screen.getByTestId('copy-label')).toHaveTextContent('第2份/共3份');

    fireEvent.click(nextBtn);
    expect(screen.getByTestId('copy-label')).toHaveTextContent('第3份/共3份');
    expect(nextBtn.disabled).toBe(true);

    fireEvent.click(prevBtn);
    expect(screen.getByTestId('copy-label')).toHaveTextContent('第2份/共3份');
  });

  it('renders multiple pages when quizzes exceed page capacity', () => {
    // QUIZZES_PER_PAGE = 76, so 80 quizzes should produce 2 pages
    const quizzes = Array.from({ length: 80 }, (_, i) =>
      makeQuiz([i % 10, 1], ['+'], (i % 10) + 1)
    );
    render(<PreviewArea result={makeResult(quizzes)} />);
    const pages = screen.getAllByTestId('a4-page');
    expect(pages.length).toBe(2);
  });

  it('displays warnings when present', () => {
    const result: GenerationResult = {
      copies: [{ copyIndex: 1, quizzes: [makeQuiz([1, 1], ['+'], 2)] }],
      warnings: ['题目数量不足'],
    };
    render(<PreviewArea result={result} />);
    expect(screen.getByTestId('warnings')).toHaveTextContent('题目数量不足');
  });
});
