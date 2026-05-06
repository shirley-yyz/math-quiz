/**
 * 口算出题系统 - 题目生成器主函数
 */
import type { Quiz, QuizConfig, QuizCopy, QuizGroup, GenerationResult, DifficultyLevel, QuizType } from '../types';
import { difficultyRules } from './difficulty-rules';

/** 将题目格式化为用于去重比较的字符串 */
function quizToKey(quiz: Quiz): string {
  let key = String(quiz.operands[0]);
  for (let i = 0; i < quiz.operators.length; i++) {
    key += quiz.operators[i] + quiz.operands[i + 1];
  }
  return key;
}

const MAX_RETRIES = 100;

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
        seen.add(key);
        quizzes.push(quiz);
        generated = true;
        break;
      } else {
        retries++;
      }
    }

    if (!generated) {
      if (duplicateCount < maxDuplicates) {
        const quiz = rule.generate();
        quizzes.push(quiz);
        duplicateCount++;
      } else {
        const warning = `难度级别 ${level}（${rule.label}）：请求生成 ${count} 道题目，实际只能生成 ${quizzes.length} 道不重复题目`;
        return { quizzes, warning };
      }
    }
  }

  return { quizzes };
}

function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * 为填空题随机选择一个操作数位置作为空白
 */
function assignBlankPosition(quiz: Quiz): number {
  // 随机选一个操作数位置（不选结果位置）
  return Math.floor(Math.random() * quiz.operands.length);
}

/**
 * 根据配置生成口算题目，支持多题型
 */
export function generateQuizzes(config: QuizConfig): GenerationResult {
  const warnings: string[] = [];
  const copies: QuizCopy[] = [];
  const quizTypes = config.quizTypes && config.quizTypes.length > 0
    ? config.quizTypes
    : ['direct' as QuizType];

  for (let copyIdx = 0; copyIdx < config.copyCount; copyIdx++) {
    const groups: QuizGroup[] = [];
    const allQuizzes: Quiz[] = [];

    for (const quizType of quizTypes) {
      const typeQuizzes: Quiz[] = [];

      for (const selection of config.selections) {
        const { quizzes, warning } = generateForLevel(
          selection.difficulty,
          selection.count
        );

        // 为每道题设置题型
        const typedQuizzes = quizzes.map(q => {
          const typed: Quiz = { ...q, quizType };
          if (quizType === 'fillBlank') {
            typed.blankPosition = assignBlankPosition(q);
          }
          return typed;
        });

        typeQuizzes.push(...typedQuizzes);

        if (warning && !warnings.includes(warning)) {
          warnings.push(warning);
        }
      }

      const shuffled = shuffle(typeQuizzes);
      groups.push({ type: quizType, quizzes: shuffled });
      allQuizzes.push(...shuffled);
    }

    copies.push({
      copyIndex: copyIdx + 1,
      quizzes: allQuizzes,
      groups,
    });
  }

  return { copies, warnings };
}
