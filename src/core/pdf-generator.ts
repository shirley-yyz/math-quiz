import { jsPDF } from 'jspdf';
import type { GenerationResult } from '../types';
import { formatQuiz } from './quiz-formatter';
import { getPageQuizzes, calculatePages } from './pagination';

/** A4 page dimensions and layout constants (in mm) */
const PAGE_WIDTH = 210;
const MARGIN_TOP = 20;
const MARGIN_LEFT = 20;
const MARGIN_RIGHT = 20;
const FONT_SIZE = 12;
const LINE_HEIGHT_MULTIPLIER = 3;
const COLUMNS = 4;

/** Usable content area width */
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;
/** Column width */
const COLUMN_WIDTH = CONTENT_WIDTH / COLUMNS;

/**
 * Font size in mm (1pt ≈ 0.3528mm)
 * 14pt × 0.3528 ≈ 4.94mm
 */
const FONT_SIZE_MM = FONT_SIZE * 0.3528;

/** Line height = font size × 2.5 multiplier */
const LINE_HEIGHT = FONT_SIZE_MM * LINE_HEIGHT_MULTIPLIER;

/** Header area height (Name + Time line) */
const HEADER_HEIGHT = 15;

/**
 * Render the page header with Name and Time fields.
 * Uses English labels since jsPDF default fonts don't support CJK characters.
 */
function renderHeader(doc: jsPDF): void {
  const headerY = MARGIN_TOP + FONT_SIZE_MM;
  doc.setFontSize(FONT_SIZE);
  doc.text('Name: ____________', MARGIN_LEFT, headerY);
  doc.text('Time: ____________', MARGIN_LEFT + CONTENT_WIDTH / 2, headerY);
}

/**
 * Render quizzes on a single page in a 4-column layout.
 */
function renderPage(doc: jsPDF, quizStrings: string[]): void {
  renderHeader(doc);

  const startY = MARGIN_TOP + HEADER_HEIGHT;

  for (let i = 0; i < quizStrings.length; i++) {
    const col = i % COLUMNS;
    const row = Math.floor(i / COLUMNS);
    const x = MARGIN_LEFT + col * COLUMN_WIDTH;
    const y = startY + row * LINE_HEIGHT + FONT_SIZE_MM;

    doc.text(quizStrings[i], x, y);
  }
}

/**
 * Generate a PDF file from the quiz generation result and trigger browser download.
 *
 * Layout matches the preview area:
 * - A4 size (210mm × 297mm)
 * - 20mm margins on all sides
 * - 4 equal-width columns
 * - 14pt font size with 2.5× line height
 * - Header with Name and Time fields on each page
 * - Each copy starts on a new page
 */
export function generatePDF(result: GenerationResult): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  doc.setFont('helvetica');
  doc.setFontSize(FONT_SIZE);

  let isFirstPage = true;

  for (const copy of result.copies) {
    const totalPages = calculatePages(copy.quizzes.length);

    for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
      if (!isFirstPage) {
        doc.addPage();
      }
      isFirstPage = false;

      const pageQuizzes = getPageQuizzes(copy.quizzes, pageIdx);
      const quizStrings = pageQuizzes.map(formatQuiz);
      renderPage(doc, quizStrings);
    }
  }

  const filename = generatePDFFilename();
  doc.save(filename);
}

/**
 * Generate a PDF filename with the current timestamp.
 * Format: "口算练习题_YYYYMMDD_HHmmss.pdf"
 */
export function generatePDFFilename(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `口算练习题_${year}${month}${day}_${hours}${minutes}${seconds}.pdf`;
}
