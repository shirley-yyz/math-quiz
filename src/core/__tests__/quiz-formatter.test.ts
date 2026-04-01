import { describe, it, expect } from 'vitest';
import { formatQuiz, formatExpression, parseExpression } from '../quiz-formatter';
import type { Quiz } from '../../types';

describe('formatQuiz', () => {
  it('formats a two-operand addition', () => {
    const quiz: Quiz = { operands: [12, 3], operators: ['+'], answer: 15, difficulty: 'b' };
    expect(formatQuiz(quiz)).toBe('12 + 3 = ____');
  });

  it('formats a two-operand subtraction', () => {
    const quiz: Quiz = { operands: [15, 7], operators: ['-'], answer: 8, difficulty: 'e' };
    expect(formatQuiz(quiz)).toBe('15 - 7 = ____');
  });

  it('formats a three-operand expression', () => {
    const quiz: Quiz = { operands: [3, 4, 2], operators: ['+', '-'], answer: 5, difficulty: 'h' };
    expect(formatQuiz(quiz)).toBe('3 + 4 - 2 = ____');
  });

  it('formats a three-operand consecutive addition', () => {
    const quiz: Quiz = { operands: [1, 2, 3], operators: ['+', '+'], answer: 6, difficulty: 'f' };
    expect(formatQuiz(quiz)).toBe('1 + 2 + 3 = ____');
  });

  it('formats a three-operand consecutive subtraction', () => {
    const quiz: Quiz = { operands: [9, 3, 2], operators: ['-', '-'], answer: 4, difficulty: 'g' };
    expect(formatQuiz(quiz)).toBe('9 - 3 - 2 = ____');
  });

  it('handles zero operands', () => {
    const quiz: Quiz = { operands: [0, 0], operators: ['+'], answer: 0, difficulty: 'a' };
    expect(formatQuiz(quiz)).toBe('0 + 0 = ____');
  });
});

describe('formatExpression', () => {
  it('formats a two-operand addition compactly', () => {
    const quiz: Quiz = { operands: [12, 3], operators: ['+'], answer: 15, difficulty: 'b' };
    expect(formatExpression(quiz)).toBe('12+3');
  });

  it('formats a two-operand subtraction compactly', () => {
    const quiz: Quiz = { operands: [15, 7], operators: ['-'], answer: 8, difficulty: 'e' };
    expect(formatExpression(quiz)).toBe('15-7');
  });

  it('formats a three-operand expression compactly', () => {
    const quiz: Quiz = { operands: [3, 4, 2], operators: ['+', '-'], answer: 5, difficulty: 'h' };
    expect(formatExpression(quiz)).toBe('3+4-2');
  });
});

describe('parseExpression', () => {
  it('parses a simple addition', () => {
    const result = parseExpression('12+3');
    expect(result.operands).toEqual([12, 3]);
    expect(result.operators).toEqual(['+']);
    expect(result.answer).toBe(15);
    expect(result.difficulty).toBe('a');
  });

  it('parses a simple subtraction', () => {
    const result = parseExpression('15-7');
    expect(result.operands).toEqual([15, 7]);
    expect(result.operators).toEqual(['-']);
    expect(result.answer).toBe(8);
    expect(result.difficulty).toBe('a');
  });

  it('parses a three-operand mixed expression', () => {
    const result = parseExpression('3+8-4');
    expect(result.operands).toEqual([3, 8, 4]);
    expect(result.operators).toEqual(['+', '-']);
    expect(result.answer).toBe(7);
    expect(result.difficulty).toBe('a');
  });

  it('parses a three-operand consecutive addition', () => {
    const result = parseExpression('1+2+3');
    expect(result.operands).toEqual([1, 2, 3]);
    expect(result.operators).toEqual(['+', '+']);
    expect(result.answer).toBe(6);
    expect(result.difficulty).toBe('a');
  });

  it('parses a three-operand consecutive subtraction', () => {
    const result = parseExpression('9-3-2');
    expect(result.operands).toEqual([9, 3, 2]);
    expect(result.operators).toEqual(['-', '-']);
    expect(result.answer).toBe(4);
    expect(result.difficulty).toBe('a');
  });
});

describe('roundtrip: formatExpression -> parseExpression', () => {
  it('roundtrips a two-operand quiz correctly', () => {
    const original: Quiz = { operands: [12, 3], operators: ['+'], answer: 15, difficulty: 'b' };
    const parsed = parseExpression(formatExpression(original));
    expect(parsed.operands).toEqual(original.operands);
    expect(parsed.operators).toEqual(original.operators);
    expect(parsed.answer).toBe(original.answer);
  });

  it('roundtrips a three-operand quiz correctly', () => {
    const original: Quiz = { operands: [5, 3, 2], operators: ['+', '-'], answer: 6, difficulty: 'h' };
    const parsed = parseExpression(formatExpression(original));
    expect(parsed.operands).toEqual(original.operands);
    expect(parsed.operators).toEqual(original.operators);
    expect(parsed.answer).toBe(original.answer);
  });
});
