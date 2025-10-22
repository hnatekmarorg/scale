export const DEPLOYMENT_STATE = {
  ON: 'on',
  OFF: 'off'
};

export const API_ENDPOINTS = {
  DEPLOYMENTS: '/api/v1/deployments',
  TOGGLE: '/api/v1/toggle'
};

export const DEPLOYMENT = {
  namespace: 'string',
  name: 'string',
  onReplicas: 'number',
  offReplicas: 'number',
  currentReplicas: 'number',
  labels: 'object'
};