/**
 * 口算出题系统 - 题目生成器主函数
 */
import type { Quiz, QuizConfig, QuizCopy, GenerationResult, DifficultyLevel } from '../types';
import { difficultyRules, ALL_LEVELS } from './difficulty-rules';

/** 将题目格式化为用于去重比较的字符串，如 "3+5" 或 "12-3+4" */
function quizToKey(quiz: Quiz): string {
  let key = String(quiz.operands[0]);
  for (let i = 0; i < quiz.operators.length; i++) {
    key += quiz.operators[i] + quiz.operands[i + 1];
  }
  return key;
}

/** 难度级别排序索引 */
const levelOrder: Record<DifficultyLevel, number> = {} as Record<DifficultyLevel, number>;
ALL_LEVELS.forEach((level, index) => {
  levelOrder[level] = index;
});

/** 最大重试次数，超过后停止生成该级别的新题目 */
const MAX_RETRIES = 100;

/**
 * 为单个难度级别生成指定数量的题目，带去重控制
 * @returns 生成的题目数组和可能的警告信息
 */
function generateForLevel(
  level: DifficultyLevel,
  count: number,
  maxDuplicateRate: number = 0.1
): { quizzes: Quiz[]; warning?: string } {
  const rule = difficultyRules[level];
  const quizzes: Quiz[] = [];
  const seen = new Set<string>();
  const maxDuplicates = Math.floor(count * maxDuplicateRate);
  let duplicateCount = 0;

  for (let i = 0; i < count; i++) {
    let retries = 0;
    let generated = false;

    while (retries < MAX_RETRIES) {
      const quiz = rule.generate();
      const key = quizToKey(quiz);

      if (!seen.has(key)) {
        // 新题目，直接加入
        seen.add(key);
        quizzes.push(quiz);
        generated = true;
        break;
      } else {
        // 重复题目，检查是否还有重复配额
        retries++;
      }
    }

    if (!generated) {
      // 重试次数用尽，检查是否可以接受重复
      if (duplicateCount < maxDuplicates) {
        // 还有重复配额，生成一道（可能重复的）题目
        const quiz = rule.generate();
        quizzes.push(quiz);
        duplicateCount++;
      } else {
        // 重复配额也用完了，无法继续生成
        const warning = `难度级别 ${level}（${rule.label}）：请求生成 ${count} 道题目，实际只能生成 ${quizzes.length} 道不重复题目`;
        return { quizzes, warning };
      }
    }
  }

  return { quizzes };
}

/**
 * 根据配置生成口算题目
 * 
 * 功能：
 * 1. 按配置遍历每个难度级别，生成指定数量的题目
 * 2. 每份口算题内的重复率不超过10%
 * 3. 根据 copyCount 生成多份，每份独立随机生成
 * 4. 题目不足时在 warnings 中添加警告
 * 5. 题目按难度级别从低到高排序（a到r）
 * 6. 每份的 copyIndex 从1开始
 */
export function generateQuizzes(config: QuizConfig): GenerationResult {
  const warnings: string[] = [];
  const copies: QuizCopy[] = [];

  // 将 selections 按难度级别从低到高排序
  const sortedSelections = [...config.selections].sort(
    (a, b) => levelOrder[a.difficulty] - levelOrder[b.difficulty]
  );

  for (let copyIdx = 0; copyIdx < config.copyCount; copyIdx++) {
    const allQuizzes: Quiz[] = [];

    for (const selection of sortedSelections) {
      const { quizzes, warning } = generateForLevel(
        selection.difficulty,
        selection.count
      );
      allQuizzes.push(...quizzes);

      if (warning) {
        // 避免重复添加相同的警告（多份生成时同一级别可能多次警告）
        if (!warnings.includes(warning)) {
          warnings.push(warning);
        }
      }
    }

    copies.push({
      copyIndex: copyIdx + 1,
      quizzes: allQuizzes,
    });
  }

  return { copies, warnings };
}
