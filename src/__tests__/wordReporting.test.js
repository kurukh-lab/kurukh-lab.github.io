import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ReportWordModal from '../components/dictionary/ReportWordModal';

// Test suite for Word Reporting

describe('Word Reporting', () => {
  test('Submit a word report', () => {
    render(<ReportWordModal isOpen={true} wordId="1" wordText="bai" onClose={jest.fn()} />);

    // Fill in the reason using the select element
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'incorrect_definition' } });
    
    // Fill in the additional details
    fireEvent.change(screen.getByPlaceholderText('Please provide any additional information about the issue'), { target: { value: 'The definition is incorrect.' } });
    
    // Click submit button
    fireEvent.click(screen.getByText('Submit Report'));

    expect(screen.getByText('Submitting...')).toBeInTheDocument();
  });
});
