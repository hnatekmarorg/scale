export const DEPLOYMENT_STATE = {
  ON: 'on',
  OFF: 'off'
} as const;

export const API_ENDPOINTS = {
  DEPLOYMENTS: '/api/v1/deployments',
  TOGGLE: '/api/v1/toggle'
} as const;

export interface Deployment {
  namespace: string;
  name: string;
  onReplicas: number;
  offReplicas: number;
  currentReplicas: number;
  labels: Record<string, string>;
}