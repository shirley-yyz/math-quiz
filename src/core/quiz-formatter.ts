import type { Quiz, Operator } from '../types';

/**
 * 格式化为显示字符串，根据题型不同显示不同格式：
 * - direct: "12 + 3 = ____"
 * - fillBlank: "3 + ( ) = 12" 或 "( ) + 5 = 12"
 * - vertical: "12 + 3 = ____"（竖式题在预览中仍用横式显示）
 */
export function formatQuiz(quiz: Quiz): string {
  if (quiz.quizType === 'fillBlank' && quiz.blankPosition !== undefined && quiz.blankPosition >= 0) {
    return formatFillBlank(quiz);
  }
  // direct 和 vertical 都用标准格式
  let result = String(quiz.operands[0]);
  for (let i = 0; i < quiz.operators.length; i++) {
    result += ` ${quiz.operators[i]} ${quiz.operands[i + 1]}`;
  }
  result += ' = ____';
  return result;
}

/**
 * 格式化填空题，如 "3 + ( ) = 12"
 */
function formatFillBlank(quiz: Quiz): string {
  const parts: string[] = [];
  for (let i = 0; i < quiz.operands.length; i++) {
    if (i === quiz.blankPosition) {
      parts.push('( )');
    } else {
      parts.push(String(quiz.operands[i]));
    }
    if (i < quiz.operators.length) {
      parts.push(quiz.operators[i]);
    }
  }
  return parts.join(' ') + ` = ${quiz.answer}`;
}

/**
 * 格式化为紧凑算式字符串，如 "12+3"（用于去重比较）
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
 */
export function parseExpression(expr: string): Quiz {
  const operands: number[] = [];
  const operators: Operator[] = [];
  const tokens = expr.split(/([+-])/);

  for (let i = 0; i < tokens.length; i++) {
    if (i % 2 === 0) {
      operands.push(Number(tokens[i]));
    } else {
      operators.push(tokens[i] as Operator);
    }
  }

  let answer = operands[0];
  for (let i = 0; i < operators.length; i++) {
    if (operators[i] === '+') {
      answer += operands[i + 1];
    } else {
      answer -= operands[i + 1];
    }
  }

  return { operands, operators, answer, difficulty: 'a', quizType: 'direct' };
}
