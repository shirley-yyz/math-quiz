import { describe, it, expect } from 'vitest';
import { QUIZZES_PER_PAGE, calculatePages, calculateTotalPages, getPageQuizzes } from '../pagination';
import type { Quiz, QuizCopy } from '../../types';

function makeQuiz(index: number): Quiz {
  return { operands: [index, 1], operators: ['+'], answer: index + 1, difficulty: 'a' };
}
function makeQuizzes(n: number): Quiz[] {
  return Array.from({ length: n }, (_, i) => makeQuiz(i));
}

describe('QUIZZES_PER_PAGE', () => {
  it('should be 60', () => { expect(QUIZZES_PER_PAGE).toBe(60); });
});

describe('calculatePages', () => {
  it('returns 1 for 0 quizzes', () => { expect(calculatePages(0)).toBe(1); });
  it('returns 1 for 1 quiz', () => { expect(calculatePages(1)).toBe(1); });
  it('returns 1 for exactly 60', () => { expect(calculatePages(60)).toBe(1); });
  it('returns 2 for 61', () => { expect(calculatePages(61)).toBe(2); });
  it('returns 2 for 120', () => { expect(calculatePages(120)).toBe(2); });
  it('returns 3 for 121', () => { expect(calculatePages(121)).toBe(3); });
  it('returns 1 for negative', () => { expect(calculatePages(-5)).toBe(1); });
});

describe('calculateTotalPages', () => {
  it('returns 0 for empty', () => { expect(calculateTotalPages([])).toBe(0); });
  it('returns 1 for few quizzes', () => {
    expect(calculateTotalPages([{ copyIndex: 1, quizzes: makeQuizzes(10) }])).toBe(1);
  });
  it('sums pages across copies', () => {
    const copies: QuizCopy[] = [
      { copyIndex: 1, quizzes: makeQuizzes(60) },
      { copyIndex: 2, quizzes: makeQuizzes(61) },
    ];
    expect(calculateTotalPages(copies)).toBe(3);
  });
  it('counts empty copy as 1 page', () => {
    expect(calculateTotalPages([{ copyIndex: 1, quizzes: [] }, { copyIndex: 2, quizzes: [] }])).toBe(2);
  });
});

describe('getPageQuizzes', () => {
  it('returns all when <= per page', () => { expect(getPageQuizzes(makeQuizzes(50), 0)).toHaveLength(50); });
  it('returns first 60 for page 0', () => {
    const q = makeQuizzes(80);
    expect(getPageQuizzes(q, 0)).toHaveLength(60);
  });
  it('returns remaining for last page', () => {
    const q = makeQuizzes(80);
    expect(getPageQuizzes(q, 1)).toHaveLength(20);
  });
  it('returns empty for out of range', () => { expect(getPageQuizzes(makeQuizzes(50), 1)).toHaveLength(0); });
  it('returns empty for empty input', () => { expect(getPageQuizzes([], 0)).toHaveLength(0); });
});
