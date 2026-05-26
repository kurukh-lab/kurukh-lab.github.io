import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ReportWordModal from '../components/dictionary/ReportWordModal';

describe('Word Reporting', () => {
  test('Submit a word report', () => {
    render(
      <ReportWordModal
        isOpen={true}
        wordId="1"
        wordText="bai"
        onClose={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'incorrect_definition' },
    });
    fireEvent.change(
      screen.getByPlaceholderText(
        'Anything else admins should know about this issue?',
      ),
      { target: { value: 'The definition is incorrect.' } },
    );
    fireEvent.click(screen.getByText('Submit report'));

    expect(screen.getByText('Submitting…')).toBeInTheDocument();
  });
});
