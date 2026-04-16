/**
 * 口算出题系统 - 26个难度级别的验证与生成规则
 */
import type { DifficultyLevel, DifficultyRule, Operator, Quiz } from '../types';

// ============ 辅助函数 ============

/** 生成 [min, max] 范围内的随机整数 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** 计算题目的答案 */
function evaluate(quiz: Pick<Quiz, 'operands' | 'operators'>): number {
  let result = quiz.operands[0];
  for (let i = 0; i < quiz.operators.length; i++) {
    if (quiz.operators[i] === '+') {
      result += quiz.operands[i + 1];
    } else {
      result -= quiz.operands[i + 1];
    }
  }
  return result;
}

/** 获取个位数 */
function onesDigit(n: number): number {
  return n % 10;
}

/** 所有难度级别，按 a 到 z 排序 */
export const ALL_LEVELS: DifficultyLevel[] = [
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i',
  'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r',
  's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
];

// ============ 级别 a: 10以内加减法 ============
const ruleA: DifficultyRule = {
  level: 'a',
  label: '10以内加减法',
  operandCount: 2,
  validate: (quiz: Quiz): boolean => {
    if (quiz.operands.length !== 2 || quiz.operators.length !== 1) return false;
    const [a, b] = quiz.operands;
    const op = quiz.operators[0];
    if (op !== '+' && op !== '-') return false;
    if (a < 0 || a > 10 || b < 0 || b > 10) return false;
    const result = op === '+' ? a + b : a - b;
    if (result < 0 || result > 10) return false;
    return quiz.answer === result;
  },
  generate: (): Quiz => {
    const op: Operator = Math.random() < 0.5 ? '+' : '-';
    let a: number, b: number;
    if (op === '+') {
      a = randomInt(0, 10);
      b = randomInt(0, 10 - a);
    } else {
      a = randomInt(0, 10);
      b = randomInt(0, a);
    }
    const answer = op === '+' ? a + b : a - b;
    return { operands: [a, b], operators: [op], answer, difficulty: 'a' };
  },
};

// ============ 级别 b: 20以内不进位加法 ============
const ruleB: DifficultyRule = {
  level: 'b',
  label: '20以内不进位加法',
  operandCount: 2,
  validate: (quiz: Quiz): boolean => {
    if (quiz.operands.length !== 2 || quiz.operators.length !== 1) return false;
    const [a, b] = quiz.operands;
    if (quiz.operators[0] !== '+') return false;
    if (a < 10 || a > 19) return false;
    if (b < 1 || b > 9) return false;
    if (onesDigit(a) + b >= 10) return false;
    return quiz.answer === a + b;
  },
  generate: (): Quiz => {
    let a: number, b: number;
    do {
      a = randomInt(10, 19);
      b = randomInt(1, 9);
    } while (onesDigit(a) + b >= 10);
    return { operands: [a, b], operators: ['+'], answer: a + b, difficulty: 'b' };
  },
};

// ============ 级别 c: 20以内不退位减法 ============
const ruleC: DifficultyRule = {
  level: 'c',
  label: '20以内不退位减法',
  operandCount: 2,
  validate: (quiz: Quiz): boolean => {
    if (quiz.operands.length !== 2 || quiz.operators.length !== 1) return false;
    const [a, b] = quiz.operands;
    if (quiz.operators[0] !== '-') return false;
    if (a < 10 || a > 19) return false;
    if (b < 1 || b > 9) return false;
    if (onesDigit(a) < b) return false;
    return quiz.answer === a - b;
  },
  generate: (): Quiz => {
    let a: number, b: number;
    do {
      a = randomInt(10, 19);
      b = randomInt(1, 9);
    } while (onesDigit(a) < b);
    return { operands: [a, b], operators: ['-'], answer: a - b, difficulty: 'c' };
  },
};

// ============ 级别 d: 20以内进位加法 ============
const ruleD: DifficultyRule = {
  level: 'd',
  label: '20以内进位加法',
  operandCount: 2,
  validate: (quiz: Quiz): boolean => {
    if (quiz.operands.length !== 2 || quiz.operators.length !== 1) return false;
    const [a, b] = quiz.operands;
    if (quiz.operators[0] !== '+') return false;
    if (a < 1 || a > 19) return false;
    if (b < 1 || b > 19) return false;
    const sum = a + b;
    if (sum < 11 || sum > 20) return false;
    if (onesDigit(a) + onesDigit(b) < 10) return false;
    return quiz.answer === sum;
  },
  generate: (): Quiz => {
    let a: number, b: number;
    do {
      a = randomInt(1, 19);
      b = randomInt(1, 19);
    } while (
      a + b < 11 || a + b > 20 ||
      onesDigit(a) + onesDigit(b) < 10
    );
    return { operands: [a, b], operators: ['+'], answer: a + b, difficulty: 'd' };
  },
};

// ============ 级别 e: 20以内退位减法 ============
const ruleE: DifficultyRule = {
  level: 'e',
  label: '20以内退位减法',
  operandCount: 2,
  validate: (quiz: Quiz): boolean => {
    if (quiz.operands.length !== 2 || quiz.operators.length !== 1) return false;
    const [a, b] = quiz.operands;
    if (quiz.operators[0] !== '-') return false;
    if (a < 11 || a > 20) return false;
    if (b < 1 || b > 9) return false;
    if (a - b <= 0) return false;
    if (onesDigit(a) >= b) return false;
    return quiz.answer === a - b;
  },
  generate: (): Quiz => {
    let a: number, b: number;
    do {
      a = randomInt(11, 20);
      b = randomInt(1, 9);
    } while (a - b <= 0 || onesDigit(a) >= b);
    return { operands: [a, b], operators: ['-'], answer: a - b, difficulty: 'e' };
  },
};

// ============ 级别 f: 10以内连加 ============
const ruleF: DifficultyRule = {
  level: 'f',
  label: '10以内连加',
  operandCount: 3,
  validate: (quiz: Quiz): boolean => {
    if (quiz.operands.length !== 3 || quiz.operators.length !== 2) return false;
    if (quiz.operators[0] !== '+' || quiz.operators[1] !== '+') return false;
    const [a, b, c] = quiz.operands;
    if (a < 1 || a > 9 || b < 1 || b > 9 || c < 1 || c > 9) return false;
    if (a + b + c > 10) return false;
    return quiz.answer === a + b + c;
  },
  generate: (): Quiz => {
    let a: number, b: number, c: number;
    do {
      a = randomInt(1, 9);
      b = randomInt(1, 9);
      c = randomInt(1, 9);
    } while (a + b + c > 10);
    return { operands: [a, b, c], operators: ['+', '+'], answer: a + b + c, difficulty: 'f' };
  },
};

// ============ 级别 g: 10以内连减 ============
const ruleG: DifficultyRule = {
  level: 'g',
  label: '10以内连减',
  operandCount: 3,
  validate: (quiz: Quiz): boolean => {
    if (quiz.operands.length !== 3 || quiz.operators.length !== 2) return false;
    if (quiz.operators[0] !== '-' || quiz.operators[1] !== '-') return false;
    const [a, b, c] = quiz.operands;
    if (a < 2 || a > 10) return false;
    if (b < 1 || b > 9 || c < 1 || c > 9) return false;
    const mid = a - b;
    if (mid < 0) return false;
    const result = mid - c;
    if (result < 0) return false;
    return quiz.answer === result;
  },
  generate: (): Quiz => {
    let a: number, b: number, c: number;
    do {
      a = randomInt(2, 10);
      b = randomInt(1, 9);
      c = randomInt(1, 9);
    } while (a - b < 0 || a - b - c < 0);
    return { operands: [a, b, c], operators: ['-', '-'], answer: a - b - c, difficulty: 'g' };
  },
};

// ============ 级别 h: 10以内混合加减 ============
const ruleH: DifficultyRule = {
  level: 'h',
  label: '10以内混合加减',
  operandCount: 3,
  validate: (quiz: Quiz): boolean => {
    if (quiz.operands.length !== 3 || quiz.operators.length !== 2) return false;
    const [a, b, c] = quiz.operands;
    const [op1, op2] = quiz.operators;
    // 必须包含加法和减法各至少一个
    const ops = [op1, op2];
    if (!ops.includes('+') || !ops.includes('-')) return false;
    if (a < 1 || a > 9 || b < 1 || b > 9 || c < 1 || c > 9) return false;
    const mid = op1 === '+' ? a + b : a - b;
    if (mid < 0 || mid > 10) return false;
    const result = op2 === '+' ? mid + c : mid - c;
    if (result < 0 || result > 10) return false;
    return quiz.answer === result;
  },
  generate: (): Quiz => {
    // 随机选择运算符组合：+- 或 -+
    const patterns: [Operator, Operator][] = [['+', '-'], ['-', '+']];
    const [op1, op2] = patterns[randomInt(0, 1)];
    let a: number, b: number, c: number;
    do {
      a = randomInt(1, 9);
      b = randomInt(1, 9);
      c = randomInt(1, 9);
      const mid = op1 === '+' ? a + b : a - b;
      if (mid < 0 || mid > 10) continue;
      const result = op2 === '+' ? mid + c : mid - c;
      if (result >= 0 && result <= 10) break;
    } while (true);
    const mid = op1 === '+' ? a! + b! : a! - b!;
    const result = op2 === '+' ? mid + c! : mid - c!;
    return { operands: [a!, b!, c!], operators: [op1, op2], answer: result, difficulty: 'h' };
  },
};

// ============ 级别 i: 20以内不进位连加 ============
const ruleI: DifficultyRule = {
  level: 'i',
  label: '20以内不进位连加',
  operandCount: 3,
  validate: (quiz: Quiz): boolean => {
    if (quiz.operands.length !== 3 || quiz.operators.length !== 2) return false;
    if (quiz.operators[0] !== '+' || quiz.operators[1] !== '+') return false;
    const [a, b, c] = quiz.operands;
    if (a < 10 || a > 18) return false;
    if (b < 1 || b > 9 || c < 1 || c > 9) return false;
    const mid = a + b;
    if (mid > 20) return false;
    const result = mid + c;
    if (result > 20) return false;
    // 每步个位数之和均小于10
    if (onesDigit(a) + b >= 10) return false;
    if (onesDigit(mid) + c >= 10) return false;
    return quiz.answer === result;
  },
  generate: (): Quiz => {
    let a: number, b: number, c: number;
    do {
      a = randomInt(10, 18);
      b = randomInt(1, 9);
      c = randomInt(1, 9);
    } while (
      onesDigit(a) + b >= 10 ||
      a + b > 20 ||
      onesDigit(a + b) + c >= 10 ||
      a + b + c > 20
    );
    return { operands: [a, b, c], operators: ['+', '+'], answer: a + b + c, difficulty: 'i' };
  },
};

// ============ 级别 j: 20以内不退位连减 ============
const ruleJ: DifficultyRule = {
  level: 'j',
  label: '20以内不退位连减',
  operandCount: 3,
  validate: (quiz: Quiz): boolean => {
    if (quiz.operands.length !== 3 || quiz.operators.length !== 2) return false;
    if (quiz.operators[0] !== '-' || quiz.operators[1] !== '-') return false;
    const [a, b, c] = quiz.operands;
    if (a < 12 || a > 19) return false;
    if (b < 1 || b > 9 || c < 1 || c > 9) return false;
    const mid = a - b;
    if (mid < 0) return false;
    const result = mid - c;
    if (result < 0) return false;
    // 每步被减数的个位均大于等于减数
    if (onesDigit(a) < b) return false;
    if (onesDigit(mid) < c) return false;
    return quiz.answer === result;
  },
  generate: (): Quiz => {
    let a: number, b: number, c: number;
    do {
      a = randomInt(12, 19);
      b = randomInt(1, 9);
      c = randomInt(1, 9);
    } while (
      onesDigit(a) < b ||
      a - b < 0 ||
      onesDigit(a - b) < c ||
      a - b - c < 0
    );
    return { operands: [a, b, c], operators: ['-', '-'], answer: a - b - c, difficulty: 'j' };
  },
};

// ============ 级别 k: 20以内不进位混合加减 ============
const ruleK: DifficultyRule = {
  level: 'k',
  label: '20以内不进位混合加减',
  operandCount: 3,
  validate: (quiz: Quiz): boolean => {
    if (quiz.operands.length !== 3 || quiz.operators.length !== 2) return false;
    const [a, b, c] = quiz.operands;
    const [op1, op2] = quiz.operators;
    const ops = [op1, op2];
    if (!ops.includes('+') || !ops.includes('-')) return false;
    if (a < 10 || a > 19) return false;
    if (b < 1 || b > 9 || c < 1 || c > 9) return false;
    const mid = op1 === '+' ? a + b : a - b;
    if (mid < 0 || mid > 20) return false;
    const result = op2 === '+' ? mid + c : mid - c;
    if (result < 0 || result > 20) return false;
    // 每步运算均不产生进位或退位
    if (op1 === '+' && onesDigit(a) + b >= 10) return false;
    if (op1 === '-' && onesDigit(a) < b) return false;
    if (op2 === '+' && onesDigit(mid) + c >= 10) return false;
    if (op2 === '-' && onesDigit(mid) < c) return false;
    return quiz.answer === result;
  },
  generate: (): Quiz => {
    const patterns: [Operator, Operator][] = [['+', '-'], ['-', '+']];
    const [op1, op2] = patterns[randomInt(0, 1)];
    let a: number, b: number, c: number;
    do {
      a = randomInt(10, 19);
      b = randomInt(1, 9);
      c = randomInt(1, 9);
      const mid = op1 === '+' ? a + b : a - b;
      if (mid < 0 || mid > 20) continue;
      // 检查第一步无进位/退位
      if (op1 === '+' && onesDigit(a) + b >= 10) continue;
      if (op1 === '-' && onesDigit(a) < b) continue;
      // 检查第二步无进位/退位
      if (op2 === '+' && onesDigit(mid) + c >= 10) continue;
      if (op2 === '-' && onesDigit(mid) < c) continue;
      const result = op2 === '+' ? mid + c : mid - c;
      if (result >= 0 && result <= 20) break;
    } while (true);
    const mid = op1 === '+' ? a! + b! : a! - b!;
    const result = op2 === '+' ? mid + c! : mid - c!;
    return { operands: [a!, b!, c!], operators: [op1, op2], answer: result, difficulty: 'k' };
  },
};

// ============ 级别 l: 20以内进位连加 ============
const ruleL: DifficultyRule = {
  level: 'l',
  label: '20以内进位连加',
  operandCount: 3,
  validate: (quiz: Quiz): boolean => {
    if (quiz.operands.length !== 3 || quiz.operators.length !== 2) return false;
    if (quiz.operators[0] !== '+' || quiz.operators[1] !== '+') return false;
    const [a, b, c] = quiz.operands;
    if (a < 1 || a > 9 || b < 1 || b > 9 || c < 1 || c > 9) return false;
    const sum = a + b + c;
    if (sum < 11 || sum > 20) return false;
    // 至少有一步加法产生进位（个位数之和大于等于10）
    const mid = a + b;
    const step1Carry = onesDigit(a) + b >= 10;
    const step2Carry = onesDigit(mid) + c >= 10;
    if (!step1Carry && !step2Carry) return false;
    return quiz.answer === sum;
  },
  generate: (): Quiz => {
    let a: number, b: number, c: number;
    do {
      a = randomInt(1, 9);
      b = randomInt(1, 9);
      c = randomInt(1, 9);
      const sum = a + b + c;
      if (sum < 11 || sum > 20) continue;
      const mid = a + b;
      const step1Carry = onesDigit(a) + b >= 10;
      const step2Carry = onesDigit(mid) + c >= 10;
      if (step1Carry || step2Carry) break;
    } while (true);
    return { operands: [a!, b!, c!], operators: ['+', '+'], answer: a! + b! + c!, difficulty: 'l' };
  },
};

// ============ 级别 m: 20以内退位连减 ============
const ruleM: DifficultyRule = {
  level: 'm',
  label: '20以内退位连减',
  operandCount: 3,
  validate: (quiz: Quiz): boolean => {
    if (quiz.operands.length !== 3 || quiz.operators.length !== 2) return false;
    if (quiz.operators[0] !== '-' || quiz.operators[1] !== '-') return false;
    const [a, b, c] = quiz.operands;
    if (a < 11 || a > 20) return false;
    if (b < 1 || b > 9 || c < 1 || c > 9) return false;
    const mid = a - b;
    if (mid < 0) return false;
    const result = mid - c;
    if (result < 0) return false;
    // 至少有一步减法产生退位（被减数个位小于减数）
    const step1Borrow = onesDigit(a) < b;
    const step2Borrow = onesDigit(mid) < c;
    if (!step1Borrow && !step2Borrow) return false;
    return quiz.answer === result;
  },
  generate: (): Quiz => {
    let a: number, b: number, c: number;
    do {
      a = randomInt(11, 20);
      b = randomInt(1, 9);
      c = randomInt(1, 9);
      const mid = a - b;
      if (mid < 0 || mid - c < 0) continue;
      const step1Borrow = onesDigit(a) < b;
      const step2Borrow = onesDigit(mid) < c;
      if (step1Borrow || step2Borrow) break;
    } while (true);
    return { operands: [a!, b!, c!], operators: ['-', '-'], answer: a! - b! - c!, difficulty: 'm' };
  },
};

// ============ 级别 n: 20以内进位与退位混合加减 ============
const ruleN: DifficultyRule = {
  level: 'n',
  label: '20以内进退位混合加减',
  operandCount: 3,
  validate: (quiz: Quiz): boolean => {
    if (quiz.operands.length !== 3 || quiz.operators.length !== 2) return false;
    const [a, b, c] = quiz.operands;
    const [op1, op2] = quiz.operators;
    const ops = [op1, op2];
    if (!ops.includes('+') || !ops.includes('-')) return false;
    if (a < 10 || a > 20) return false;
    if (b < 1 || b > 9 || c < 1 || c > 9) return false;
    const mid = op1 === '+' ? a + b : a - b;
    if (mid < 0 || mid > 20) return false;
    const result = op2 === '+' ? mid + c : mid - c;
    if (result < 0 || result > 20) return false;
    // 至少有一步产生进位或退位
    let hasCarryOrBorrow = false;
    if (op1 === '+' && onesDigit(a) + b >= 10) hasCarryOrBorrow = true;
    if (op1 === '-' && onesDigit(a) < b) hasCarryOrBorrow = true;
    if (op2 === '+' && onesDigit(mid) + c >= 10) hasCarryOrBorrow = true;
    if (op2 === '-' && onesDigit(mid) < c) hasCarryOrBorrow = true;
    if (!hasCarryOrBorrow) return false;
    return quiz.answer === result;
  },
  generate: (): Quiz => {
    const patterns: [Operator, Operator][] = [['+', '-'], ['-', '+']];
    const [op1, op2] = patterns[randomInt(0, 1)];
    let a: number, b: number, c: number;
    do {
      a = randomInt(10, 20);
      b = randomInt(1, 9);
      c = randomInt(1, 9);
      const mid = op1 === '+' ? a + b : a - b;
      if (mid < 0 || mid > 20) continue;
      const result = op2 === '+' ? mid + c : mid - c;
      if (result < 0 || result > 20) continue;
      // 检查是否至少有一步进位或退位
      let hasCarryOrBorrow = false;
      if (op1 === '+' && onesDigit(a) + b >= 10) hasCarryOrBorrow = true;
      if (op1 === '-' && onesDigit(a) < b) hasCarryOrBorrow = true;
      if (op2 === '+' && onesDigit(mid) + c >= 10) hasCarryOrBorrow = true;
      if (op2 === '-' && onesDigit(mid) < c) hasCarryOrBorrow = true;
      if (hasCarryOrBorrow) break;
    } while (true);
    const mid = op1 === '+' ? a! + b! : a! - b!;
    const result = op2 === '+' ? mid + c! : mid - c!;
    return { operands: [a!, b!, c!], operators: [op1, op2], answer: result, difficulty: 'n' };
  },
};

// ============ 级别 o: 两位数减一位数不退位减法 ============
const ruleO: DifficultyRule = {
  level: 'o',
  label: '两位数减一位数不退位减法',
  operandCount: 2,
  validate: (quiz: Quiz): boolean => {
    if (quiz.operands.length !== 2 || quiz.operators.length !== 1) return false;
    const [a, b] = quiz.operands;
    if (quiz.operators[0] !== '-') return false;
    if (a < 21 || a > 99) return false;
    if (b < 1 || b > 9) return false;
    if (onesDigit(a) < b) return false;
    return quiz.answer === a - b;
  },
  generate: (): Quiz => {
    let a: number, b: number;
    do {
      a = randomInt(21, 99);
      b = randomInt(1, 9);
    } while (onesDigit(a) < b);
    return { operands: [a, b], operators: ['-'], answer: a - b, difficulty: 'o' };
  },
};

// ============ 级别 p: 两位数加一位数不进位加法 ============
const ruleP: DifficultyRule = {
  level: 'p',
  label: '两位数加一位数不进位加法',
  operandCount: 2,
  validate: (quiz: Quiz): boolean => {
    if (quiz.operands.length !== 2 || quiz.operators.length !== 1) return false;
    const [a, b] = quiz.operands;
    if (quiz.operators[0] !== '+') return false;
    if (a < 10 || a > 99) return false;
    if (b < 1 || b > 9) return false;
    if (a + b > 100) return false;
    if (onesDigit(a) + b >= 10) return false;
    return quiz.answer === a + b;
  },
  generate: (): Quiz => {
    let a: number, b: number;
    do {
      a = randomInt(10, 99);
      b = randomInt(1, 9);
    } while (a + b > 100 || onesDigit(a) + b >= 10);
    return { operands: [a, b], operators: ['+'], answer: a + b, difficulty: 'p' };
  },
};

// ============ 级别 q: 两位数减一位数退位减法 ============
const ruleQ: DifficultyRule = {
  level: 'q',
  label: '两位数减一位数退位减法',
  operandCount: 2,
  validate: (quiz: Quiz): boolean => {
    if (quiz.operands.length !== 2 || quiz.operators.length !== 1) return false;
    const [a, b] = quiz.operands;
    if (quiz.operators[0] !== '-') return false;
    if (a < 21 || a > 99) return false;
    if (b < 1 || b > 9) return false;
    if (onesDigit(a) >= b) return false;
    return quiz.answer === a - b;
  },
  generate: (): Quiz => {
    let a: number, b: number;
    do {
      a = randomInt(21, 99);
      b = randomInt(1, 9);
    } while (onesDigit(a) >= b);
    return { operands: [a, b], operators: ['-'], answer: a - b, difficulty: 'q' };
  },
};

// ============ 级别 r: 两位数加一位数进位加法 ============
const ruleR: DifficultyRule = {
  level: 'r',
  label: '两位数加一位数进位加法',
  operandCount: 2,
  validate: (quiz: Quiz): boolean => {
    if (quiz.operands.length !== 2 || quiz.operators.length !== 1) return false;
    const [a, b] = quiz.operands;
    if (quiz.operators[0] !== '+') return false;
    if (a < 10 || a > 99) return false;
    if (b < 1 || b > 9) return false;
    if (a + b > 100) return false;
    if (onesDigit(a) + b < 10) return false;
    return quiz.answer === a + b;
  },
  generate: (): Quiz => {
    let a: number, b: number;
    do {
      a = randomInt(10, 99);
      b = randomInt(1, 9);
    } while (a + b > 100 || onesDigit(a) + b < 10);
    return { operands: [a, b], operators: ['+'], answer: a + b, difficulty: 'r' };
  },
};

// ============ 级别 s: 整十数加整十数 ============
const ruleS: DifficultyRule = {
  level: 's',
  label: '整十数加整十数',
  operandCount: 2,
  validate: (quiz: Quiz): boolean => {
    if (quiz.operands.length !== 2 || quiz.operators.length !== 1) return false;
    const [a, b] = quiz.operands;
    if (quiz.operators[0] !== '+') return false;
    if (a < 10 || a > 90 || a % 10 !== 0) return false;
    if (b < 10 || b > 90 || b % 10 !== 0) return false;
    if (a + b > 100) return false;
    return quiz.answer === a + b;
  },
  generate: (): Quiz => {
    let a: number, b: number;
    do {
      a = randomInt(1, 9) * 10;
      b = randomInt(1, 9) * 10;
    } while (a + b > 100);
    return { operands: [a, b], operators: ['+'], answer: a + b, difficulty: 's' };
  },
};

// ============ 级别 t: 整十数减整十数 ============
const ruleT: DifficultyRule = {
  level: 't',
  label: '整十数减整十数',
  operandCount: 2,
  validate: (quiz: Quiz): boolean => {
    if (quiz.operands.length !== 2 || quiz.operators.length !== 1) return false;
    const [a, b] = quiz.operands;
    if (quiz.operators[0] !== '-') return false;
    if (a < 20 || a > 90 || a % 10 !== 0) return false;
    if (b < 10 || b > 80 || b % 10 !== 0) return false;
    if (a - b < 0) return false;
    return quiz.answer === a - b;
  },
  generate: (): Quiz => {
    const a = randomInt(2, 9) * 10;
    const b = randomInt(1, a / 10 - 1) * 10;
    return { operands: [a, b], operators: ['-'], answer: a - b, difficulty: 't' };
  },
};

// ============ 级别 u: 整十数连加 ============
const ruleU: DifficultyRule = {
  level: 'u',
  label: '整十数连加',
  operandCount: 3,
  validate: (quiz: Quiz): boolean => {
    if (quiz.operands.length !== 3 || quiz.operators.length !== 2) return false;
    if (quiz.operators[0] !== '+' || quiz.operators[1] !== '+') return false;
    const [a, b, c] = quiz.operands;
    if (a % 10 !== 0 || b % 10 !== 0 || c % 10 !== 0) return false;
    if (a < 10 || a > 80 || b < 10 || b > 80 || c < 10 || c > 80) return false;
    if (a + b + c > 100) return false;
    return quiz.answer === a + b + c;
  },
  generate: (): Quiz => {
    let a: number, b: number, c: number;
    do {
      a = randomInt(1, 8) * 10;
      b = randomInt(1, 8) * 10;
      c = randomInt(1, 8) * 10;
    } while (a + b + c > 100);
    return { operands: [a, b, c], operators: ['+', '+'], answer: a + b + c, difficulty: 'u' };
  },
};

// ============ 级别 v: 整十数连减 ============
const ruleV: DifficultyRule = {
  level: 'v',
  label: '整十数连减',
  operandCount: 3,
  validate: (quiz: Quiz): boolean => {
    if (quiz.operands.length !== 3 || quiz.operators.length !== 2) return false;
    if (quiz.operators[0] !== '-' || quiz.operators[1] !== '-') return false;
    const [a, b, c] = quiz.operands;
    if (a % 10 !== 0 || b % 10 !== 0 || c % 10 !== 0) return false;
    if (a < 30 || a > 100 || b < 10 || b > 80 || c < 10 || c > 80) return false;
    if (a - b < 0 || a - b - c < 0) return false;
    return quiz.answer === a - b - c;
  },
  generate: (): Quiz => {
    let a: number, b: number, c: number;
    do {
      a = randomInt(3, 10) * 10;
      b = randomInt(1, 8) * 10;
      c = randomInt(1, 8) * 10;
    } while (a - b < 0 || a - b - c < 0);
    return { operands: [a, b, c], operators: ['-', '-'], answer: a - b - c, difficulty: 'v' };
  },
};

// ============ 级别 w: 整十数加减混合 ============
const ruleW: DifficultyRule = {
  level: 'w',
  label: '整十数加减混合',
  operandCount: 3,
  validate: (quiz: Quiz): boolean => {
    if (quiz.operands.length !== 3 || quiz.operators.length !== 2) return false;
    const [a, b, c] = quiz.operands;
    const [op1, op2] = quiz.operators;
    if (!([op1, op2].includes('+') && [op1, op2].includes('-'))) return false;
    if (a % 10 !== 0 || b % 10 !== 0 || c % 10 !== 0) return false;
    if (a < 10 || a > 90 || b < 10 || b > 90 || c < 10 || c > 90) return false;
    const mid = op1 === '+' ? a + b : a - b;
    if (mid < 0 || mid > 100) return false;
    const result = op2 === '+' ? mid + c : mid - c;
    if (result < 0 || result > 100) return false;
    return quiz.answer === result;
  },
  generate: (): Quiz => {
    const patterns: [Operator, Operator][] = [['+', '-'], ['-', '+']];
    const [op1, op2] = patterns[randomInt(0, 1)];
    let a: number, b: number, c: number;
    do {
      a = randomInt(1, 9) * 10;
      b = randomInt(1, 9) * 10;
      c = randomInt(1, 9) * 10;
      const mid = op1 === '+' ? a + b : a - b;
      if (mid < 0 || mid > 100) continue;
      const result = op2 === '+' ? mid + c : mid - c;
      if (result >= 0 && result <= 100) break;
    } while (true);
    const mid = op1 === '+' ? a! + b! : a! - b!;
    const result = op2 === '+' ? mid + c! : mid - c!;
    return { operands: [a!, b!, c!], operators: [op1, op2], answer: result, difficulty: 'w' };
  },
};

// ============ 级别 x: 整十数加一位数 ============
const ruleX: DifficultyRule = {
  level: 'x',
  label: '整十数加一位数',
  operandCount: 2,
  validate: (quiz: Quiz): boolean => {
    if (quiz.operands.length !== 2 || quiz.operators.length !== 1) return false;
    const [a, b] = quiz.operands;
    if (quiz.operators[0] !== '+') return false;
    if (a < 10 || a > 90 || a % 10 !== 0) return false;
    if (b < 1 || b > 9) return false;
    return quiz.answer === a + b;
  },
  generate: (): Quiz => {
    const a = randomInt(1, 9) * 10;
    const b = randomInt(1, 9);
    return { operands: [a, b], operators: ['+'], answer: a + b, difficulty: 'x' };
  },
};

// ============ 级别 y: 整十数减一位数不退位 ============
const ruleY: DifficultyRule = {
  level: 'y',
  label: '整十数减一位数不退位',
  operandCount: 2,
  validate: (quiz: Quiz): boolean => {
    if (quiz.operands.length !== 2 || quiz.operators.length !== 1) return false;
    const [a, b] = quiz.operands;
    if (quiz.operators[0] !== '-') return false;
    if (a < 10 || a > 99) return false;
    if (b < 1 || b > 9) return false;
    // 不退位：个位 >= 减数（如 56-4，个位6>=4）
    if (onesDigit(a) < b) return false;
    // a 不能是整十数（那是 z 级别的退位场景）
    if (a % 10 === 0) return false;
    return quiz.answer === a - b;
  },
  generate: (): Quiz => {
    let a: number, b: number;
    do {
      a = randomInt(11, 99);
      b = randomInt(1, 9);
    } while (a % 10 === 0 || onesDigit(a) < b);
    return { operands: [a, b], operators: ['-'], answer: a - b, difficulty: 'y' };
  },
};

// ============ 级别 z: 整十数减一位数退位 ============
const ruleZ: DifficultyRule = {
  level: 'z',
  label: '整十数减一位数退位',
  operandCount: 2,
  validate: (quiz: Quiz): boolean => {
    if (quiz.operands.length !== 2 || quiz.operators.length !== 1) return false;
    const [a, b] = quiz.operands;
    if (quiz.operators[0] !== '-') return false;
    // 整十数：如60, 70等
    if (a < 20 || a > 90 || a % 10 !== 0) return false;
    if (b < 1 || b > 9) return false;
    return quiz.answer === a - b;
  },
  generate: (): Quiz => {
    const a = randomInt(2, 9) * 10;
    const b = randomInt(1, 9);
    return { operands: [a, b], operators: ['-'], answer: a - b, difficulty: 'z' };
  },
};

// ============ 导出 ============

/** 所有难度规则的注册表 */
export const difficultyRules: Record<DifficultyLevel, DifficultyRule> = {
  a: ruleA, b: ruleB, c: ruleC, d: ruleD, e: ruleE, f: ruleF,
  g: ruleG, h: ruleH, i: ruleI, j: ruleJ, k: ruleK, l: ruleL,
  m: ruleM, n: ruleN, o: ruleO, p: ruleP, q: ruleQ, r: ruleR,
  s: ruleS, t: ruleT, u: ruleU, v: ruleV, w: ruleW, x: ruleX,
  y: ruleY, z: ruleZ,
};

/** 导出辅助函数供测试使用 */
export { randomInt, evaluate };
