/**
 * 输入验证函数
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * 验证题目数量：仅接受1到200之间的正整数
 */
export function validateQuizCount(value: number): ValidationResult {
  if (!Number.isInteger(value) || value < 1 || value > 200) {
    return { valid: false, error: '请输入1到200之间的正整数' };
  }
  return { valid: true };
}

/**
 * 验证份数：仅接受1到10之间的正整数
 */
export function validateCopyCount(value: number): ValidationResult {
  if (!Number.isInteger(value) || value < 1 || value > 10) {
    return { valid: false, error: '请输入1到10之间的正整数' };
  }
  return { valid: true };
}
