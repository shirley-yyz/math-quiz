import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ConfigPanel from '../ConfigPanel';

function setup(overrides: Partial<Parameters<typeof ConfigPanel>[0]> = {}) {
  const onConfigChange = vi.fn();
  const onDownloadPDF = vi.fn();
  const props = {
    onConfigChange,
    onDownloadPDF,
    hasQuizzes: false,
    ...overrides,
  };
  const utils = render(<ConfigPanel {...props} />);
  return { ...utils, onConfigChange, onDownloadPDF };
}

describe('ConfigPanel', () => {
  it('renders all 18 difficulty level checkboxes', () => {
    setup();
    const levels = 'abcdefghijklmnopqr'.split('');
    for (const l of levels) {
      expect(screen.getByTestId(`check-${l}`)).toBeInTheDocument();
    }
  });

  it('does not show count input when level is unchecked', () => {
    setup();
    expect(screen.queryByTestId('count-a')).not.toBeInTheDocument();
  });

  it('shows count input with default 50 when level is checked', () => {
    setup();
    fireEvent.click(screen.getByTestId('check-a'));
    const input = screen.getByTestId('count-a') as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.value).toBe('50');
  });

  it('hides count input and clears config when level is unchecked', () => {
    setup();
    fireEvent.click(screen.getByTestId('check-a'));
    expect(screen.getByTestId('count-a')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('check-a'));
    expect(screen.queryByTestId('count-a')).not.toBeInTheDocument();
  });

  it('supports multiple selections', () => {
    setup();
    fireEvent.click(screen.getByTestId('check-a'));
    fireEvent.click(screen.getByTestId('check-b'));
    expect(screen.getByTestId('count-a')).toBeInTheDocument();
    expect(screen.getByTestId('count-b')).toBeInTheDocument();
  });

  it('has copy count input with default value 1', () => {
    setup();
    const input = screen.getByTestId('copy-count') as HTMLInputElement;
    expect(input.value).toBe('1');
  });

  it('disables download button and shows hint when nothing is selected', () => {
    setup();
    const btn = screen.getByTestId('download-btn') as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
    expect(screen.getByTestId('no-selection-hint')).toHaveTextContent('请先选择难度类型');
  });

  it('enables download button when a level is checked and hasQuizzes is true', () => {
    setup({ hasQuizzes: true });
    fireEvent.click(screen.getByTestId('check-a'));
    const btn = screen.getByTestId('download-btn') as HTMLButtonElement;
    expect(btn.disabled).toBe(false);
  });

  it('keeps download button disabled when level is checked but hasQuizzes is false', () => {
    setup({ hasQuizzes: false });
    fireEvent.click(screen.getByTestId('check-a'));
    const btn = screen.getByTestId('download-btn') as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  it('calls onDownloadPDF when download button is clicked', () => {
    const { onDownloadPDF } = setup({ hasQuizzes: true });
    fireEvent.click(screen.getByTestId('check-a'));
    fireEvent.click(screen.getByTestId('download-btn'));
    expect(onDownloadPDF).toHaveBeenCalledTimes(1);
  });

  it('shows error for invalid quiz count', () => {
    setup();
    fireEvent.click(screen.getByTestId('check-a'));
    const input = screen.getByTestId('count-a');
    fireEvent.change(input, { target: { value: '0' } });
    expect(screen.getByTestId('error-a')).toBeInTheDocument();
  });

  it('shows error for invalid copy count', () => {
    setup();
    const input = screen.getByTestId('copy-count');
    fireEvent.change(input, { target: { value: '11' } });
    expect(screen.getByTestId('error-copy-count')).toBeInTheDocument();
  });

  it('calls onConfigChange with correct config when a level is checked', () => {
    const { onConfigChange } = setup();
    fireEvent.click(screen.getByTestId('check-a'));
    expect(onConfigChange).toHaveBeenCalledWith({
      selections: [{ difficulty: 'a', count: 50 }],
      copyCount: 1,
    });
  });

  it('calls onConfigChange with updated count when count is changed', () => {
    const { onConfigChange } = setup();
    fireEvent.click(screen.getByTestId('check-a'));
    onConfigChange.mockClear();
    const input = screen.getByTestId('count-a');
    fireEvent.change(input, { target: { value: '100' } });
    expect(onConfigChange).toHaveBeenCalledWith({
      selections: [{ difficulty: 'a', count: 100 }],
      copyCount: 1,
    });
  });

  it('does not call onConfigChange when input is invalid', () => {
    const { onConfigChange } = setup();
    fireEvent.click(screen.getByTestId('check-a'));
    onConfigChange.mockClear();
    const input = screen.getByTestId('count-a');
    fireEvent.change(input, { target: { value: '999' } });
    expect(onConfigChange).not.toHaveBeenCalled();
  });
});
