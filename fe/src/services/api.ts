import { API_ENDPOINTS } from '../types';

interface Deployment {
  namespace: string;
  name: string;
  onReplicas: number;
  offReplicas: number;
  currentReplicas: number;
  labels: Record<string, string>;
}

const API_BASE_URL = process.env.REACT_APP_API_URL || '';

const api = {
  getDeployments: async (namespace = 'default'): Promise<Deployment[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.DEPLOYMENTS}?namespace=${namespace}`);
      
      if (response.status === 204) {
        return [];
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch deployments');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching deployments:', error);
      throw error;
    }
  },

  toggleDeployment: async (namespace: string, deployment: string, state: 'on' | 'off'): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.TOGGLE}/${namespace}/${deployment}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ state }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to toggle deployment');
      }

      return await response.json();
    } catch (error) {
      console.error('Error toggling deployment:', error);
      throw error;
    }
  }
};

export default api;