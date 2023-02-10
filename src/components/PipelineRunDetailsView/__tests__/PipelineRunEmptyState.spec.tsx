import * as React from 'react';
import { render, screen } from '@testing-library/react';
import PipelineRunEmptyState from '../PipelineRunEmptyState';

jest.mock('react-router-dom', () => ({
  Link: (props) => <a href={props.to}>{props.children}</a>,
}));

jest.mock('../../../utils/workspace-context-utils', () => ({
  useWorkspace: jest.fn(() => 'test-ws'),
}));

describe('PipelineRunEmptyState', () => {
  it('should render correct Link to Application Name', () => {
    render(<PipelineRunEmptyState applicationName="test" />);
    expect(screen.getByRole('link').getAttribute('href')).toBe(
      '/stonesoup/workspaces/test-ws/applications/import?application=test',
    );
    screen.getByText('Add component');
  });
});
