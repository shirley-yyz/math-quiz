import type { Quiz, Operator } from '../types';

/**
 * 格式化为显示字符串，如 "12 + 3 = ____"
 * 操作数和运算符之间用空格分隔，末尾加 " = ____"
 */
export function formatQuiz(quiz: Quiz): string {
  let result = String(quiz.operands[0]);
  for (let i = 0; i < quiz.operators.length; i++) {
    result += ` ${quiz.operators[i]} ${quiz.operands[i + 1]}`;
  }
  result += ' = ____';
  return result;
}

/**
 * 格式化为紧凑算式字符串，如 "12+3"（用于去重比较）
 * 无空格，不包含 "= ____"
 */
export function formatExpression(quiz: Quiz): string {
  let result = String(quiz.operands[0]);
  for (let i = 0; i < quiz.operators.length; i++) {
    result += `${quiz.operators[i]}${quiz.operands[i + 1]}`;
  }
  return result;
}

/**
 * 从算式字符串解析回 Quiz 对象
 * 输入格式如 "12+3" 或 "3+8-4"
 * difficulty 设为 'a'（默认值，因为无法从字符串推断难度）
 */
export function parseExpression(expr: string): Quiz {
  const operands: number[] = [];
  const operators: Operator[] = [];

  // Split by operators while keeping them
  const tokens = expr.split(/([+-])/);

  for (let i = 0; i < tokens.length; i++) {
    if (i % 2 === 0) {
      operands.push(Number(tokens[i]));
    } else {
      operators.push(tokens[i] as Operator);
    }
  }

  // Calculate answer by evaluating left to right
  let answer = operands[0];
  for (let i = 0; i < operators.length; i++) {
    if (operators[i] === '+') {
      answer += operands[i + 1];
    } else {
      answer -= operands[i + 1];
    }
  }

  return {
    operands,
    operators,
    answer,
    difficulty: 'a',
  };
}
