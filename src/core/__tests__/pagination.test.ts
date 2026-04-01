import { describe, it, expect } from 'vitest';
import {
  QUIZZES_PER_PAGE,
  calculatePages,
  calculateTotalPages,
  getPageQuizzes,
} from '../pagination';
import type { Quiz, QuizCopy } from '../../types';

function makeQuiz(index: number): Quiz {
  return { operands: [index, 1], operators: ['+'], answer: index + 1, difficulty: 'a' };
}

function makeQuizzes(n: number): Quiz[] {
  return Array.from({ length: n }, (_, i) => makeQuiz(i));
}

describe('QUIZZES_PER_PAGE', () => {
  it('should be 76', () => {
    expect(QUIZZES_PER_PAGE).toBe(76);
  });
});

describe('calculatePages', () => {
  it('should return 1 for 0 quizzes', () => { expect(calculatePages(0)).toBe(1); });
  it('should return 1 for 1 quiz', () => { expect(calculatePages(1)).toBe(1); });
  it('should return 1 for exactly 76 quizzes', () => { expect(calculatePages(76)).toBe(1); });
  it('should return 2 for 77 quizzes', () => { expect(calculatePages(77)).toBe(2); });
  it('should return 2 for 152 quizzes', () => { expect(calculatePages(152)).toBe(2); });
  it('should return 3 for 153 quizzes', () => { expect(calculatePages(153)).toBe(3); });
  it('should return 1 for negative count', () => { expect(calculatePages(-5)).toBe(1); });
});

describe('calculateTotalPages', () => {
  it('should return 0 for empty copies array', () => { expect(calculateTotalPages([])).toBe(0); });
  it('should return 1 for a single copy with few quizzes', () => {
    expect(calculateTotalPages([{ copyIndex: 1, quizzes: makeQuizzes(10) }])).toBe(1);
  });
  it('should sum pages across multiple copies', () => {
    const copies: QuizCopy[] = [
      { copyIndex: 1, quizzes: makeQuizzes(76) },
      { copyIndex: 2, quizzes: makeQuizzes(77) },
    ];
    expect(calculateTotalPages(copies)).toBe(3);
  });
  it('should handle copies with varying quiz counts', () => {
    const copies: QuizCopy[] = [
      { copyIndex: 1, quizzes: makeQuizzes(200) },
      { copyIndex: 2, quizzes: makeQuizzes(50) },
      { copyIndex: 3, quizzes: makeQuizzes(153) },
    ];
    expect(calculateTotalPages(copies)).toBe(7);
  });
  it('should count each empty copy as 1 page', () => {
    const copies: QuizCopy[] = [{ copyIndex: 1, quizzes: [] }, { copyIndex: 2, quizzes: [] }];
    expect(calculateTotalPages(copies)).toBe(2);
  });
});

describe('getPageQuizzes', () => {
  it('should return all quizzes when count <= QUIZZES_PER_PAGE', () => {
    const quizzes = makeQuizzes(50);
    expect(getPageQuizzes(quizzes, 0)).toHaveLength(50);
  });
  it('should return first 76 quizzes for page 0 when more exist', () => {
    const quizzes = makeQuizzes(100);
    const page0 = getPageQuizzes(quizzes, 0);
    expect(page0).toHaveLength(76);
    expect(page0[0]).toEqual(quizzes[0]);
    expect(page0[75]).toEqual(quizzes[75]);
  });
  it('should return remaining quizzes for the last page', () => {
    const quizzes = makeQuizzes(100);
    const page1 = getPageQuizzes(quizzes, 1);
    expect(page1).toHaveLength(24);
    expect(page1[0]).toEqual(quizzes[76]);
  });
  it('should return empty array for out-of-range page index', () => {
    expect(getPageQuizzes(makeQuizzes(50), 1)).toHaveLength(0);
  });
  it('should return empty array for empty quizzes', () => {
    expect(getPageQuizzes([], 0)).toHaveLength(0);
  });
  it('should correctly paginate exactly 76 quizzes', () => {
    expect(getPageQuizzes(makeQuizzes(76), 0)).toHaveLength(76);
    expect(getPageQuizzes(makeQuizzes(76), 1)).toHaveLength(0);
  });
});
