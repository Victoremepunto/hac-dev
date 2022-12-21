import * as React from 'react';
import '@testing-library/jest-dom';
import { ModelKind, Node, NodeModel, Visualization } from '@patternfly/react-topology';
import { screen } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import { useBuildPipelines } from '../../../../../../../hooks/useBuildPipelines';
import { useComponents } from '../../../../../../../hooks/useComponents';
import { useEnvironments } from '../../../../../../../hooks/useEnvironments';
import { useIntegrationTestScenarios } from '../../../../../../../hooks/useIntegrationTestScenarios';
import { useReleasePlans } from '../../../../../../../hooks/useReleasePlans';
import { useReleases } from '../../../../../../../hooks/useReleases';
import { useSnapshotsEnvironmentBindings } from '../../../../../../../hooks/useSnapshotsEnvironmentBindings';
import { useTestPipelines } from '../../../../../../../hooks/useTestPipelines';
import { useNamespace } from '../../../../../../../utils/namespace-context-utils';
import { routerRenderer } from '../../../../../../../utils/test-utils';
import { layoutFactory, PipelineLayout } from '../../../../../../topology/factories';
import {
  mockSnapshotsEnvironmentBindings,
  mockBuildPipelinesData,
  mockComponentsData,
  mockEnvironmentsData,
  mockIntegrationTestScenariosData,
  mockReleasePlansData,
  mockReleasesData,
  mockTestPipelinesData,
} from '../../../sections/__data__';
import { componentFactory } from '../../factories';
import { useAppWorkflowData } from '../../hooks/useAppWorkflowData';
import { WorkflowNodeModelData } from '../../types';
import { getLinkForElement, TYPE_DESCRIPTIONS } from '../../utils/node-utils';
import WorkflowNodeTipContent from '../WorkflowNodeTipContent';

jest.mock('@openshift/dynamic-plugin-sdk-utils', () => ({
  useK8sWatchResource: jest.fn(),
}));

jest.mock('../../../../../../../utils/namespace-context-utils', () => ({
  useNamespace: jest.fn(() => 'test-ns'),
}));

jest.mock('../../../../../../../hooks/useComponents', () => ({
  useComponents: jest.fn(),
}));
jest.mock('../../../../../../../hooks/useIntegrationTestScenarios', () => ({
  useIntegrationTestScenarios: jest.fn(),
}));
jest.mock('../../../../../../../hooks/useBuildPipelines', () => ({
  useBuildPipelines: jest.fn(),
}));
jest.mock('../../../../../../../hooks/useEnvironments', () => ({
  useEnvironments: jest.fn(),
}));
jest.mock('../../../../../../../hooks/useReleases', () => ({
  useReleases: jest.fn(),
}));
jest.mock('../../../../../../../hooks/useReleasePlans', () => ({
  useReleasePlans: jest.fn(),
}));
jest.mock('../../../../../../../hooks/useTestPipelines', () => ({
  useTestPipelines: jest.fn(),
}));
jest.mock('../../../../../../../hooks/useSnapshotsEnvironmentBindings', () => ({
  useSnapshotsEnvironmentBindings: jest.fn(),
}));

const useActiveNamespaceMock = useNamespace as jest.Mock;
const useComponentsMock = useComponents as jest.Mock;
const useIntegrationTestScenariosMock = useIntegrationTestScenarios as jest.Mock;
const useBuildPipelinesMock = useBuildPipelines as jest.Mock;
const useEnvironmentsMock = useEnvironments as jest.Mock;
const useReleasesMock = useReleases as jest.Mock;
const useReleasePlansMock = useReleasePlans as jest.Mock;
const useTestPipelinesMock = useTestPipelines as jest.Mock;
const useSnapshotsEnvironmentBindingsMock = useSnapshotsEnvironmentBindings as jest.Mock;

describe('WorkflowNode', () => {
  beforeEach(() => {
    useActiveNamespaceMock.mockReturnValue('test-ns');
    useComponentsMock.mockReturnValue([mockComponentsData, true]);
    useIntegrationTestScenariosMock.mockReturnValue([mockIntegrationTestScenariosData, true]);
    useBuildPipelinesMock.mockReturnValue([mockBuildPipelinesData, true]);
    useEnvironmentsMock.mockReturnValue([mockEnvironmentsData, true]);
    useReleasePlansMock.mockReturnValue([mockReleasePlansData, true]);
    useReleasesMock.mockReturnValue([mockReleasesData, true]);
    useTestPipelinesMock.mockReturnValue([mockTestPipelinesData, true]);
    useSnapshotsEnvironmentBindingsMock.mockReturnValue([mockSnapshotsEnvironmentBindings, true]);

    const createElement = document.createElement.bind(document);
    document.createElement = (tagName) => {
      if (tagName === 'canvas') {
        return {
          getContext: () => ({
            measureText: () => ({}),
          }),
        };
      }
      return createElement(tagName);
    };
  });

  const getController = (expanded: boolean) => {
    const { result } = renderHook(() => useAppWorkflowData('test', expanded));
    const [model] = result.current;

    const mockGraph = {
      x: 15,
      y: 15,
      id: 'application-overview-graph',
      type: ModelKind.graph,
      layout: PipelineLayout.WORKFLOW_VISUALIZATION,
    };
    const mockModel = { graph: mockGraph, ...model };
    const visualization = new Visualization();
    visualization.setRenderConstraint(false);
    visualization.registerLayoutFactory(layoutFactory);
    visualization.registerComponentFactory(componentFactory);
    visualization.fromModel(mockModel);
    return visualization;
  };

  it('should render group node tooltips', () => {
    const visualization = getController(false);

    let mockElement = visualization.getNodeById('components');
    let tipContent = routerRenderer(<WorkflowNodeTipContent element={mockElement} />);

    expect(
      screen.getByText(TYPE_DESCRIPTIONS[mockElement.getData().workflowType]),
    ).toBeInTheDocument();
    let linkData = getLinkForElement(mockElement);
    expect(linkData.tab).toBe('components');
    expect(linkData.filter).toBeUndefined();
    expect(screen.getAllByTestId('child-row')).toHaveLength(mockComponentsData.length);
    tipContent.unmount();

    mockElement = visualization.getNodeById('builds');
    tipContent = routerRenderer(<WorkflowNodeTipContent element={mockElement} />);

    expect(
      screen.getByText(TYPE_DESCRIPTIONS[mockElement.getData().workflowType]),
    ).toBeInTheDocument();
    expect(screen.getByTestId('pipeline-runs-link')).toBeVisible();
    expect(screen.getAllByTestId('child-row')).toHaveLength(mockComponentsData.length);
    tipContent.unmount();

    mockElement = visualization.getNodeById('tests');
    tipContent = routerRenderer(<WorkflowNodeTipContent element={mockElement} />);

    expect(
      screen.getByText(TYPE_DESCRIPTIONS[mockElement.getData().workflowType]),
    ).toBeInTheDocument();

    expect(screen.getByTestId('element-link')).toBeVisible();
    linkData = getLinkForElement(mockElement);
    expect(linkData.tab).toBe('integrationtests');
    expect(linkData.filter).toBeUndefined();

    expect(screen.getByTestId('pipeline-runs-link')).toBeVisible();
    expect(screen.getAllByTestId('child-row')).toHaveLength(4);

    tipContent.unmount();
  });
  it('should render node tooltips', () => {
    const visualization = getController(true);
    const mockGroup = visualization.getNodeById('components');
    const mockElement = mockGroup.getChildren()[0] as Node<NodeModel, WorkflowNodeModelData>;

    routerRenderer(<WorkflowNodeTipContent element={mockElement} />);

    expect(
      screen.getByText(TYPE_DESCRIPTIONS[mockElement.getData().workflowType]),
    ).toBeInTheDocument();
    const link = screen.getByTestId('element-link');
    expect(link).toBeVisible();
    const linkData = getLinkForElement(mockElement);
    expect(linkData.tab).toBe('components');
    expect(linkData.filter.name).toBe('name');
    expect(linkData.filter.value).toBe(mockElement.getLabel());
    expect(screen.queryAllByTestId('child-row')).toHaveLength(0);
  });
});