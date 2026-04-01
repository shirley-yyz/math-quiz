/**
 * 口算出题系统 - 核心类型定义
 */

/** 难度级别：a-r 共18个阶梯 */
export type DifficultyLevel =
  | 'a' | 'b' | 'c' | 'd' | 'e' | 'f'
  | 'g' | 'h' | 'i' | 'j' | 'k' | 'l'
  | 'm' | 'n' | 'o' | 'p' | 'q' | 'r';

/** 运算符 */
export type Operator = '+' | '-';

/** 单道题目 */
export interface Quiz {
  operands: number[];       // 操作数列表，2个或3个
  operators: Operator[];    // 运算符列表，1个或2个
  answer: number;           // 正确答案
  difficulty: DifficultyLevel;
}

/** 用户配置 */
export interface QuizConfig {
  selections: {
    difficulty: DifficultyLevel;
    count: number;           // 1-200
  }[];
  copyCount: number;         // 1-10
}

/** 单份口算题集合 */
export interface QuizCopy {
  copyIndex: number;         // 份数编号，从1开始
  quizzes: Quiz[];           // 该份所有题目
}

/** 生成结果 */
export interface GenerationResult {
  copies: QuizCopy[];
  warnings: string[];        // 如题目不足的警告
}

/** 难度规则定义 */
export interface DifficultyRule {
  level: DifficultyLevel;
  label: string;              // 中文名称
  operandCount: 2 | 3;       // 操作数个数
  validate: (quiz: Quiz) => boolean;  // 验证题目是否符合规则
  generate: () => Quiz;       // 生成一道符合规则的题目
}
