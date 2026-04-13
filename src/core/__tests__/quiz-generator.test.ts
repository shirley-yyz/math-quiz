import { describe, it, expect } from 'vitest';
import { generateQuizzes } from '../quiz-generator';
import type { QuizConfig, DifficultyLevel } from '../../types';

/** Helper: build a simple config */
function makeConfig(
  selections: { difficulty: DifficultyLevel; count: number }[],
  copyCount = 1
): QuizConfig {
  return { selections, copyCount };
}

/** Helper: quiz to key string for dedup checking */
function quizKey(q: { operands: number[]; operators: string[] }): string {
  let key = String(q.operands[0]);
  for (let i = 0; i < q.operators.length; i++) {
    key += q.operators[i] + q.operands[i + 1];
  }
  return key;
}

describe('generateQuizzes', () => {
  it('should generate the correct number of copies', () => {
    const config = makeConfig([{ difficulty: 'a', count: 5 }], 3);
    const result = generateQuizzes(config);
    expect(result.copies).toHaveLength(3);
  });

  it('should assign copyIndex starting from 1', () => {
    const config = makeConfig([{ difficulty: 'a', count: 5 }], 3);
    const result = generateQuizzes(config);
    expect(result.copies.map(c => c.copyIndex)).toEqual([1, 2, 3]);
  });

  it('should generate the requested number of quizzes per copy', () => {
    const config = makeConfig([
      { difficulty: 'a', count: 10 },
      { difficulty: 'b', count: 5 },
    ]);
    const result = generateQuizzes(config);
    expect(result.copies[0].quizzes).toHaveLength(15);
  });

  it('should randomly shuffle quizzes from different difficulty levels', () => {
    const config = makeConfig([
      { difficulty: 'r', count: 3 },
      { difficulty: 'a', count: 3 },
      { difficulty: 'f', count: 3 },
    ]);
    const result = generateQuizzes(config);
    const quizzes = result.copies[0].quizzes;

    // Should contain all 3 difficulty types
    const difficulties = new Set(quizzes.map(q => q.difficulty));
    expect(difficulties).toContain('a');
    expect(difficulties).toContain('f');
    expect(difficulties).toContain('r');
    expect(quizzes).toHaveLength(9);
  });

  it('should keep duplicate rate within 10%', () => {
    const config = makeConfig([{ difficulty: 'a', count: 50 }]);
    const result = generateQuizzes(config);
    const quizzes = result.copies[0].quizzes;
    const keys = quizzes.map(quizKey);
    const uniqueKeys = new Set(keys);
    const duplicates = keys.length - uniqueKeys.size;
    expect(duplicates / keys.length).toBeLessThanOrEqual(0.1);
  });

  it('should generate each copy independently (different quiz sequences)', () => {
    // Use a level with enough variety to make identical copies extremely unlikely
    const config = makeConfig([{ difficulty: 'p', count: 20 }], 3);
    const result = generateQuizzes(config);

    const sequences = result.copies.map(copy =>
      copy.quizzes.map(quizKey).join(',')
    );

    // At least two copies should differ (extremely unlikely all 3 are identical)
    const uniqueSequences = new Set(sequences);
    expect(uniqueSequences.size).toBeGreaterThan(1);
  });

  it('should produce a warning when not enough unique quizzes can be generated', () => {
    // Level f (10以内连加): 1-9 operands, sum ≤ 10 — limited unique combos
    const config = makeConfig([{ difficulty: 'f', count: 200 }]);
    const result = generateQuizzes(config);
    // Should have at least one warning about level f
    expect(result.warnings.length).toBeGreaterThanOrEqual(1);
    expect(result.warnings.some(w => w.includes('f'))).toBe(true);
  });

  it('should return empty copies array for empty selections', () => {
    const config = makeConfig([], 2);
    const result = generateQuizzes(config);
    expect(result.copies).toHaveLength(2);
    result.copies.forEach(copy => {
      expect(copy.quizzes).toHaveLength(0);
    });
    expect(result.warnings).toHaveLength(0);
  });

  it('should assign correct difficulty to each generated quiz', () => {
    const config = makeConfig([
      { difficulty: 'b', count: 5 },
      { difficulty: 'e', count: 5 },
    ]);
    const result = generateQuizzes(config);
    const quizzes = result.copies[0].quizzes;
    quizzes.forEach(q => {
      expect(['b', 'e']).toContain(q.difficulty);
    });
  });

  it('should handle single quiz request', () => {
    const config = makeConfig([{ difficulty: 'a', count: 1 }]);
    const result = generateQuizzes(config);
    expect(result.copies[0].quizzes).toHaveLength(1);
    expect(result.warnings).toHaveLength(0);
  });
});
