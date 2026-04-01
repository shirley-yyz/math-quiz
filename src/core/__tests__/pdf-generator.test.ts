import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { GenerationResult } from '../../types';

// Mock jsPDF at module level (hoisted by vitest)
const mockSave = vi.fn();
const mockAddPage = vi.fn();
const mockSetFont = vi.fn();
const mockSetFontSize = vi.fn();
const mockText = vi.fn();

vi.mock('jspdf', () => ({
  jsPDF: vi.fn().mockImplementation(() => ({
    save: mockSave,
    addPage: mockAddPage,
    setFont: mockSetFont,
    setFontSize: mockSetFontSize,
    text: mockText,
  })),
}));

import { generatePDFFilename, generatePDF } from '../pdf-generator';

describe('generatePDFFilename', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return filename matching format 口算练习题_YYYYMMDD_HHmmss.pdf', () => {
    const filename = generatePDFFilename();
    expect(filename).toMatch(/^口算练习题_\d{8}_\d{6}\.pdf$/);
  });

  it('should use current date and time', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 2, 15, 9, 5, 30));

    const filename = generatePDFFilename();
    expect(filename).toBe('口算练习题_20240315_090530.pdf');
  });

  it('should pad single-digit month/day/hour/minute/second with zero', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 0, 1, 1, 2, 3));

    const filename = generatePDFFilename();
    expect(filename).toBe('口算练习题_20240101_010203.pdf');
  });
});

describe('generatePDF', () => {
  beforeEach(() => {
    mockSave.mockClear();
    mockAddPage.mockClear();
    mockSetFont.mockClear();
    mockSetFontSize.mockClear();
    mockText.mockClear();
  });

  it('should call jsPDF save with correct filename format', () => {
    const result: GenerationResult = {
      copies: [
        {
          copyIndex: 1,
          quizzes: [
            { operands: [3, 5], operators: ['+'], answer: 8, difficulty: 'a' },
            { operands: [7, 2], operators: ['-'], answer: 5, difficulty: 'a' },
          ],
        },
      ],
      warnings: [],
    };

    generatePDF(result);

    expect(mockSave).toHaveBeenCalledTimes(1);
    const savedFilename = mockSave.mock.calls[0][0];
    expect(savedFilename).toMatch(/^口算练习题_\d{8}_\d{6}\.pdf$/);
  });

  it('should render header and quiz text on the page', () => {
    const result: GenerationResult = {
      copies: [
        {
          copyIndex: 1,
          quizzes: [
            { operands: [3, 5], operators: ['+'], answer: 8, difficulty: 'a' },
          ],
        },
      ],
      warnings: [],
    };

    generatePDF(result);

    const textCalls = mockText.mock.calls.map((c: unknown[]) => c[0]);
    expect(textCalls).toContain('Name: ____________');
    expect(textCalls).toContain('Time: ____________');
    expect(textCalls).toContain('3 + 5 = ____');
  });

  it('should add new pages for multiple copies', () => {
    const result: GenerationResult = {
      copies: [
        {
          copyIndex: 1,
          quizzes: [
            { operands: [1, 2], operators: ['+'], answer: 3, difficulty: 'a' },
          ],
        },
        {
          copyIndex: 2,
          quizzes: [
            { operands: [4, 3], operators: ['-'], answer: 1, difficulty: 'a' },
          ],
        },
      ],
      warnings: [],
    };

    generatePDF(result);

    expect(mockAddPage).toHaveBeenCalledTimes(1);
    expect(mockSave).toHaveBeenCalledTimes(1);
  });

  it('should set helvetica font and font size 14', () => {
    const result: GenerationResult = {
      copies: [
        {
          copyIndex: 1,
          quizzes: [
            { operands: [1, 1], operators: ['+'], answer: 2, difficulty: 'a' },
          ],
        },
      ],
      warnings: [],
    };

    generatePDF(result);

    expect(mockSetFont).toHaveBeenCalledWith('helvetica');
    expect(mockSetFontSize).toHaveBeenCalledWith(12);
  });
});
