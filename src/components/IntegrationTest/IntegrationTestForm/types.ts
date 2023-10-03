import { K8sResourceCommon } from '@openshift/dynamic-plugin-sdk-utils';
import { ImportFormValues } from '../../../components/ImportForm/utils/types';
import { Param } from '../../../types/coreBuildService';

export type IntegrationTestFormValues = {
  name: string;
  url: string;
  revision?: string;
  path?: string;
  optional: boolean;
  secret?: string;
  environmentName?: string;
  environmentType?: string;
  params?: Param[];
};

export enum IntegrationTestAnnotations {
  DISPLAY_NAME = 'app.kubernetes.io/display-name',
  KIND = 'test.appstudio.openshift.io/kind',
}

export enum IntegrationTestLabels {
  OPTIONAL = 'test.appstudio.openshift.io/optional',
  SCENARIO = 'test.appstudio.openshift.io/scenario',
}

export type FormValues = ImportFormValues & {
  applicationData?: K8sResourceCommon;
  integrationTest: IntegrationTestFormValues;
};

export const ENVIRONMENTS = {
  DEFAULT: 'No environment',
};
