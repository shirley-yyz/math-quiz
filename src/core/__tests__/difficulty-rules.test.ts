import { describe, it, expect } from 'vitest';
import { difficultyRules, ALL_LEVELS } from '../difficulty-rules';
import type { Quiz } from '../../types';

describe('difficulty-rules', () => {
  // 验证 ALL_LEVELS 包含所有18个级别且按字母排序
  it('ALL_LEVELS contains all 28 levels in order', () => {
    expect(ALL_LEVELS).toEqual([
      'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i',
      'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r',
      's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
      'aa', 'ab',
    ]);
    expect(ALL_LEVELS.length).toBe(28);
  });

  // 验证 difficultyRules 包含所有28个级别
  it('difficultyRules has entries for all 28 levels', () => {
    for (const level of ALL_LEVELS) {
      expect(difficultyRules[level]).toBeDefined();
      expect(difficultyRules[level].level).toBe(level);
      expect(difficultyRules[level].label).toBeTruthy();
      expect([2, 3]).toContain(difficultyRules[level].operandCount);
    }
  });

  // 对每个级别：生成题目并验证
  describe.each(ALL_LEVELS)('level %s', (level) => {
    const rule = difficultyRules[level];

    it('generate produces a quiz that passes validate', () => {
      // 生成多道题目，全部应通过验证
      for (let i = 0; i < 20; i++) {
        const quiz = rule.generate();
        expect(quiz.difficulty).toBe(level);
        expect(quiz.operands.length).toBe(rule.operandCount);
        expect(quiz.operators.length).toBe(rule.operandCount - 1);
        expect(rule.validate(quiz)).toBe(true);
      }
    });

    it('validate rejects quizzes with wrong difficulty metadata', () => {
      const quiz = rule.generate();
      // 修改答案使其错误
      const badQuiz: Quiz = { ...quiz, answer: quiz.answer + 999 };
      expect(rule.validate(badQuiz)).toBe(false);
    });
  });

  // 级别 a: 10以内加减法 - 边界值
  describe('level a specifics', () => {
    const rule = difficultyRules['a'];

    it('validates 0+0=0', () => {
      const quiz: Quiz = { operands: [0, 0], operators: ['+'], answer: 0, difficulty: 'a' };
      expect(rule.validate(quiz)).toBe(true);
    });

    it('validates 5+5=10', () => {
      const quiz: Quiz = { operands: [5, 5], operators: ['+'], answer: 10, difficulty: 'a' };
      expect(rule.validate(quiz)).toBe(true);
    });

    it('validates 10-0=10', () => {
      const quiz: Quiz = { operands: [10, 0], operators: ['-'], answer: 10, difficulty: 'a' };
      expect(rule.validate(quiz)).toBe(true);
    });

    it('rejects 6+5=11 (result > 10)', () => {
      const quiz: Quiz = { operands: [6, 5], operators: ['+'], answer: 11, difficulty: 'a' };
      expect(rule.validate(quiz)).toBe(false);
    });

    it('rejects 3-5=-2 (negative result)', () => {
      const quiz: Quiz = { operands: [3, 5], operators: ['-'], answer: -2, difficulty: 'a' };
      expect(rule.validate(quiz)).toBe(false);
    });
  });

  // 级别 b: 20以内不进位加法
  describe('level b specifics', () => {
    const rule = difficultyRules['b'];

    it('validates 11+2=13 (no carry)', () => {
      const quiz: Quiz = { operands: [11, 2], operators: ['+'], answer: 13, difficulty: 'b' };
      expect(rule.validate(quiz)).toBe(true);
    });

    it('rejects 15+7=22 (carry: 5+7>=10)', () => {
      const quiz: Quiz = { operands: [15, 7], operators: ['+'], answer: 22, difficulty: 'b' };
      expect(rule.validate(quiz)).toBe(false);
    });

    it('rejects subtraction', () => {
      const quiz: Quiz = { operands: [15, 3], operators: ['-'], answer: 12, difficulty: 'b' };
      expect(rule.validate(quiz)).toBe(false);
    });
  });

  // 级别 d: 20以内进位加法
  describe('level d specifics', () => {
    const rule = difficultyRules['d'];

    it('validates 9+2=11 (carry: 9+2>=10)', () => {
      const quiz: Quiz = { operands: [9, 2], operators: ['+'], answer: 11, difficulty: 'd' };
      expect(rule.validate(quiz)).toBe(true);
    });

    it('rejects 5+4=9 (sum < 11)', () => {
      const quiz: Quiz = { operands: [5, 4], operators: ['+'], answer: 9, difficulty: 'd' };
      expect(rule.validate(quiz)).toBe(false);
    });

    it('rejects 11+1=12 (no carry: 1+1<10)', () => {
      const quiz: Quiz = { operands: [11, 1], operators: ['+'], answer: 12, difficulty: 'd' };
      expect(rule.validate(quiz)).toBe(false);
    });
  });

  // 级别 e: 20以内退位减法
  describe('level e specifics', () => {
    const rule = difficultyRules['e'];

    it('validates 13-5=8 (borrow: 3<5)', () => {
      const quiz: Quiz = { operands: [13, 5], operators: ['-'], answer: 8, difficulty: 'e' };
      expect(rule.validate(quiz)).toBe(true);
    });

    it('rejects 15-3=12 (no borrow: 5>=3)', () => {
      const quiz: Quiz = { operands: [15, 3], operators: ['-'], answer: 12, difficulty: 'e' };
      expect(rule.validate(quiz)).toBe(false);
    });
  });

  // 级别 f: 10以内连加
  describe('level f specifics', () => {
    const rule = difficultyRules['f'];

    it('validates 1+2+3=6', () => {
      const quiz: Quiz = { operands: [1, 2, 3], operators: ['+', '+'], answer: 6, difficulty: 'f' };
      expect(rule.validate(quiz)).toBe(true);
    });

    it('rejects 5+3+4=12 (sum > 10)', () => {
      const quiz: Quiz = { operands: [5, 3, 4], operators: ['+', '+'], answer: 12, difficulty: 'f' };
      expect(rule.validate(quiz)).toBe(false);
    });
  });

  // 级别 l: 20以内进位连加
  describe('level l specifics', () => {
    const rule = difficultyRules['l'];

    it('validates 3+8+1=12 (step1 carry: 3+8>=10)', () => {
      const quiz: Quiz = { operands: [3, 8, 1], operators: ['+', '+'], answer: 12, difficulty: 'l' };
      expect(rule.validate(quiz)).toBe(true);
    });

    it('rejects 1+2+3=6 (sum < 11)', () => {
      const quiz: Quiz = { operands: [1, 2, 3], operators: ['+', '+'], answer: 6, difficulty: 'l' };
      expect(rule.validate(quiz)).toBe(false);
    });
  });

  // 级别 o-r: 两位数运算
  describe('level o specifics', () => {
    const rule = difficultyRules['o'];

    it('validates 25-3=22 (no borrow: 5>=3)', () => {
      const quiz: Quiz = { operands: [25, 3], operators: ['-'], answer: 22, difficulty: 'o' };
      expect(rule.validate(quiz)).toBe(true);
    });

    it('rejects 21-3=18 (borrow: 1<3)', () => {
      const quiz: Quiz = { operands: [21, 3], operators: ['-'], answer: 18, difficulty: 'o' };
      expect(rule.validate(quiz)).toBe(false);
    });
  });

  describe('level r specifics', () => {
    const rule = difficultyRules['r'];

    it('validates 95+5=100 (carry: 5+5>=10)', () => {
      const quiz: Quiz = { operands: [95, 5], operators: ['+'], answer: 100, difficulty: 'r' };
      expect(rule.validate(quiz)).toBe(true);
    });

    it('rejects 91+1=92 (no carry: 1+1<10)', () => {
      const quiz: Quiz = { operands: [91, 1], operators: ['+'], answer: 92, difficulty: 'r' };
      expect(rule.validate(quiz)).toBe(false);
    });

    it('rejects sum > 100', () => {
      const quiz: Quiz = { operands: [99, 9], operators: ['+'], answer: 108, difficulty: 'r' };
      expect(rule.validate(quiz)).toBe(false);
    });
  });
});
