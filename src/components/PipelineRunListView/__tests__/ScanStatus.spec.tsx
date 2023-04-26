import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useScanResults } from '../../../hooks/useScanResults';
import { ScanStatus } from '../ScanStatus';

jest.mock('../../../hooks/useScanResults', () => ({
  useScanResults: jest.fn(),
}));

const mockScanResults = useScanResults as jest.Mock;

describe('ScanStatus', () => {
  it('shows loading indicator if results are not fetched', () => {
    mockScanResults.mockReturnValue([null, false]);
    const { container } = render(<ScanStatus pipelineRunName="test" />);
    expect(container).toHaveTextContent('Loading Vulnerability Scan status');
  });

  it('shows empty state if results are not available', () => {
    mockScanResults.mockReturnValue([null, true]);
    const { container } = render(<ScanStatus pipelineRunName="test" />);
    expect(container).toHaveTextContent('-');
  });

  it('shows scan results after values are fetched', () => {
    mockScanResults.mockReturnValue([
      { vulnerabilities: { critical: 1, high: 2, medium: 3, low: 4 } },
      true,
    ]);
    render(<ScanStatus pipelineRunName="test" />);
    expect(screen.getByTestId('scan-status-critical-test-id')).toHaveTextContent('Critical1');
    expect(screen.getByTestId('scan-status-high-test-id')).toHaveTextContent('High2');
    expect(screen.getByTestId('scan-status-medium-test-id')).toHaveTextContent('Medium3');
    expect(screen.getByTestId('scan-status-low-test-id')).toHaveTextContent('Low4');
  });
});
