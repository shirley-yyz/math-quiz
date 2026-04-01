import { describe, it, expect } from 'vitest';
import { validateQuizCount, validateCopyCount } from '../validation';

describe('validateQuizCount', () => {
  it('should accept valid values within 1-200', () => {
    expect(validateQuizCount(1)).toEqual({ valid: true });
    expect(validateQuizCount(50)).toEqual({ valid: true });
    expect(validateQuizCount(100)).toEqual({ valid: true });
    expect(validateQuizCount(200)).toEqual({ valid: true });
  });

  it('should reject zero', () => {
    const result = validateQuizCount(0);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('请输入1到200之间的正整数');
  });

  it('should reject negative numbers', () => {
    const result = validateQuizCount(-1);
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should reject values above 200', () => {
    const result = validateQuizCount(201);
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should reject non-integer values', () => {
    expect(validateQuizCount(1.5).valid).toBe(false);
    expect(validateQuizCount(99.9).valid).toBe(false);
    expect(validateQuizCount(0.1).valid).toBe(false);
  });

  it('should reject NaN and Infinity', () => {
    expect(validateQuizCount(NaN).valid).toBe(false);
    expect(validateQuizCount(Infinity).valid).toBe(false);
    expect(validateQuizCount(-Infinity).valid).toBe(false);
  });
});

describe('validateCopyCount', () => {
  it('should accept valid values within 1-10', () => {
    expect(validateCopyCount(1)).toEqual({ valid: true });
    expect(validateCopyCount(5)).toEqual({ valid: true });
    expect(validateCopyCount(10)).toEqual({ valid: true });
  });

  it('should reject zero', () => {
    const result = validateCopyCount(0);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('请输入1到10之间的正整数');
  });

  it('should reject negative numbers', () => {
    const result = validateCopyCount(-1);
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should reject values above 10', () => {
    const result = validateCopyCount(11);
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should reject non-integer values', () => {
    expect(validateCopyCount(1.5).valid).toBe(false);
    expect(validateCopyCount(9.9).valid).toBe(false);
  });

  it('should reject NaN and Infinity', () => {
    expect(validateCopyCount(NaN).valid).toBe(false);
    expect(validateCopyCount(Infinity).valid).toBe(false);
    expect(validateCopyCount(-Infinity).valid).toBe(false);
  });
});
