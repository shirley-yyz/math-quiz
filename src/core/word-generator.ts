/**
 * Word文档生成器
 */
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  PageOrientation,
  LevelFormat,
} from 'docx';
import type { GenerationResult, Quiz, QuizGroup } from '../types';
import { QUIZ_TYPE_LABELS, CHINESE_NUMBERS } from '../types';

/** A4 尺寸（以 twip 为单位，1mm = 56.7 twip） */
const PAGE_WIDTH_TWIP = Math.round(210 * 56.7);
const PAGE_HEIGHT_TWIP = Math.round(297 * 56.7);
const MARGIN_TB_TWIP = Math.round(20 * 56.7);
const MARGIN_LR_TWIP = Math.round(15.3 * 56.7);

const FONT_FAMILY = '微软雅黑';

/** 格式化题目文本 */
function formatQuizText(quiz: Quiz): string {
  if (quiz.quizType === 'fillBlank' && quiz.blankPosition !== undefined && quiz.blankPosition >= 0) {
    const parts: string[] = [];
    for (let i = 0; i < quiz.operands.length; i++) {
      parts.push(i === quiz.blankPosition ? '□' : String(quiz.operands[i]));
      if (i < quiz.operators.length) parts.push(quiz.operators[i]);
    }
    return parts.join(' ') + ` = ${quiz.answer}`;
  }
  let result = String(quiz.operands[0]);
  for (let i = 0; i < quiz.operators.length; i++) {
    result += ` ${quiz.operators[i]} ${quiz.operands[i + 1]}`;
  }
  return result + ' = ____';
}

/** 创建竖式题段落（4列） */
function createVerticalQuizParagraphs(quizzes: Quiz[]): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  const COLUMNS = 4;

  for (let i = 0; i < quizzes.length; i += COLUMNS) {
    const row = quizzes.slice(i, i + COLUMNS);

    // 横式行
    const horizontalText = row.map((quiz) => {
      const [a, b] = quiz.operands;
      const op = quiz.operators[0] || '+';
      const blankPos = quiz.blankPosition ?? -1;
      const aStr = blankPos === 0 ? '□' : String(a);
      const bStr = blankPos === 1 ? '□' : String(b);
      return `${aStr} ${op} ${bStr} = ${quiz.answer}`;
    }).join('     ');

    paragraphs.push(new Paragraph({
      children: [new TextRun({ text: horizontalText, font: FONT_FAMILY, size: 24 })],
      spacing: { line: 480 }, // 2倍行距
    }));

    // 竖式部分（4道题并列，每道3行：上数、下数+符号、横线、结果）
    for (let lineIdx = 0; lineIdx < 4; lineIdx++) {
      const lineText = row.map((quiz) => {
        const [a, b] = quiz.operands;
        const op = quiz.operators[0] || '+';
        const result = quiz.answer;
        const blankPos = quiz.blankPosition ?? -1;
        const maxDigits = Math.max(String(a).length, String(b).length, String(result).length);
        const aV = blankPos === 0 ? '□'.padStart(maxDigits) : String(a).padStart(maxDigits);
        const bV = blankPos === 1 ? '□'.padStart(maxDigits) : String(b).padStart(maxDigits);
        const rV = String(result).padStart(maxDigits);
        const line = '—'.repeat(maxDigits + 2);

        switch (lineIdx) {
          case 0: return `  ${aV}`;
          case 1: return `${op} ${bV}`;
          case 2: return line;
          case 3: return `  ${rV}`;
          default: return '';
        }
      }).join('     ');

      paragraphs.push(new Paragraph({
        children: [new TextRun({ text: lineText, font: 'Consolas', size: 24 })],
        spacing: { line: 360 },
      }));
    }

    // 行间间距
    paragraphs.push(new Paragraph({ children: [new TextRun('')], spacing: { line: 360 } }));
  }

  return paragraphs;
}

/** 创建普通题段落（每行4题） */
function createDirectQuizParagraphs(quizzes: Quiz[]): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  const COLUMNS = 4;

  for (let i = 0; i < quizzes.length; i += COLUMNS) {
    const row = quizzes.slice(i, i + COLUMNS);
    const text = row.map(formatQuizText).join('     ');
    paragraphs.push(new Paragraph({
      children: [new TextRun({ text, font: FONT_FAMILY, size: 24 })],
      spacing: { line: 720 }, // 3倍行距
    }));
  }

  return paragraphs;
}

/** 创建一份口算题的所有段落 */
function createCopyParagraphs(groups: QuizGroup[]): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  // 页眉：姓名 + 用时
  paragraphs.push(new Paragraph({
    children: [
      new TextRun({ text: '姓名：______________          用时：______________', font: FONT_FAMILY, size: 24 }),
    ],
    spacing: { after: 240 },
  }));

  groups.forEach((group, idx) => {
    // 大标题
    paragraphs.push(new Paragraph({
      children: [new TextRun({
        text: `${CHINESE_NUMBERS[idx]}、${QUIZ_TYPE_LABELS[group.type]}`,
        font: FONT_FAMILY,
        size: 28,
        bold: true,
      })],
      spacing: { before: idx === 0 ? 0 : 360, after: 120 },
    }));

    // 题目内容
    if (group.type === 'vertical') {
      paragraphs.push(...createVerticalQuizParagraphs(group.quizzes));
    } else {
      paragraphs.push(...createDirectQuizParagraphs(group.quizzes));
    }
  });

  return paragraphs;
}

/**
 * 生成 Word 文档并触发浏览器下载
 */
export async function generateWord(result: GenerationResult): Promise<void> {
  const sections = result.copies.map((copy) => {
    const groups = copy.groups || [{ type: 'direct' as const, quizzes: copy.quizzes }];
    return {
      properties: {
        page: {
          size: {
            orientation: PageOrientation.PORTRAIT,
            width: PAGE_WIDTH_TWIP,
            height: PAGE_HEIGHT_TWIP,
          },
          margin: {
            top: MARGIN_TB_TWIP,
            bottom: MARGIN_TB_TWIP,
            left: MARGIN_LR_TWIP,
            right: MARGIN_LR_TWIP,
          },
        },
      },
      children: createCopyParagraphs(groups),
    };
  });

  const doc = new Document({
    creator: '点点口算',
    title: '口算练习题',
    description: '小学生口算练习题',
    numbering: {
      config: [
        {
          reference: 'default',
          levels: [
            {
              level: 0,
              format: LevelFormat.DECIMAL,
              text: '%1.',
              alignment: AlignmentType.LEFT,
            },
          ],
        },
      ],
    },
    sections,
  });

  const blob = await Packer.toBlob(doc);
  const filename = generateWordFilename();
  triggerDownload(blob, filename);
}

/** 生成 Word 文件名 */
export function generateWordFilename(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  return `口算练习题_${y}${m}${d}_${hh}${mm}${ss}.docx`;
}

/** 触发浏览器下载 */
function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
