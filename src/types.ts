/**
 * 口算出题系统 - 核心类型定义
 */

/** 难度级别：a-x 共24个阶梯 */
export type DifficultyLevel =
  | 'a' | 'b' | 'c' | 'd' | 'e' | 'f'
  | 'g' | 'h' | 'i' | 'j' | 'k' | 'l'
  | 'm' | 'n' | 'o' | 'p' | 'q' | 'r'
  | 's' | 't' | 'u' | 'v' | 'w' | 'x';

/** 运算符 */
export type Operator = '+' | '-';

/** 题型 */
export type QuizType = 'direct' | 'fillBlank' | 'vertical';

/** 题型标签（不含编号） */
export const QUIZ_TYPE_LABELS: Record<QuizType, string> = {
  direct: '直接写得数',
  fillBlank: '口算填空题',
  vertical: '竖式填空题',
};

/** 中文数字编号 */
export const CHINESE_NUMBERS = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];

/** 单道题目 */
export interface Quiz {
  operands: number[];       // 操作数列表，2个或3个
  operators: Operator[];    // 运算符列表，1个或2个
  answer: number;           // 正确答案
  difficulty: DifficultyLevel;
  quizType?: QuizType;      // 题型（由生成器赋值）
  blankPosition?: number;   // 填空位置
}

/** 用户配置 */
export interface QuizConfig {
  selections: {
    difficulty: DifficultyLevel;
    count: number;           // 1-200
  }[];
  copyCount: number;         // 1-10
  quizTypes: QuizType[];     // 选择的题型
}

/** 按题型分组的题目 */
export interface QuizGroup {
  type: QuizType;
  quizzes: Quiz[];
}

/** 单份口算题集合 */
export interface QuizCopy {
  copyIndex: number;         // 份数编号，从1开始
  quizzes: Quiz[];           // 该份所有题目（保留兼容）
  groups?: QuizGroup[];      // 按题型分组
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
