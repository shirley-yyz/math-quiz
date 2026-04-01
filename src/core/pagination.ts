/**
 * 分页计算模块
 *
 * 基于 A4 纸张排版参数计算分页信息：
 * - A4: 210mm × 297mm
 * - 页边距：上下左右各 20mm
 * - 可用高度：297 - 20 - 20 = 257mm
 * - 页眉区域（姓名+用时）：约 15mm
 * - 可用题目区域高度：257 - 15 = 242mm
 * - 12号字体约 4.23mm 高，3倍行距 = 12.7mm 每行
 * - 每页行数：Math.floor(242 / 12.7) = 19 行
 * - 四列布局，每行 4 道题
 * - 每页容量：19 × 4 = 76 道题
 */

import type { Quiz, QuizCopy } from '../types';

/** 每页可容纳的题目数量 */
export const QUIZZES_PER_PAGE = 76;

/**
 * 计算单份需要的页数
 * @param quizCount 题目数量
 * @returns 所需页数（至少 1 页）
 */
export function calculatePages(quizCount: number): number {
  if (quizCount <= 0) return 1;
  return Math.ceil(quizCount / QUIZZES_PER_PAGE);
}

/**
 * 计算所有份的总页数（每份从新页面开始）
 * @param copies 所有份的题目集合
 * @returns 总页数
 */
export function calculateTotalPages(copies: QuizCopy[]): number {
  if (copies.length === 0) return 0;
  return copies.reduce((total, copy) => total + calculatePages(copy.quizzes.length), 0);
}

/**
 * 获取指定页的题目
 * @param quizzes 单份的全部题目
 * @param pageIndex 页码索引（从 0 开始）
 * @returns 该页的题目数组
 */
export function getPageQuizzes(quizzes: Quiz[], pageIndex: number): Quiz[] {
  const start = pageIndex * QUIZZES_PER_PAGE;
  const end = start + QUIZZES_PER_PAGE;
  return quizzes.slice(start, end);
}
