import { useState, useEffect } from 'react';
import api from '../services/api';

interface Deployment {
  namespace: string;
  name: string;
  onReplicas: number;
  offReplicas: number;
  currentReplicas: number;
  labels: Record<string, string>;
}

interface UseDeploymentsReturn {
  deployments: Deployment[];
  loading: boolean;
  error: string | null;
  refreshDeployments: () => Promise<void>;
}

export const useDeployments = (): UseDeploymentsReturn => {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDeployments = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getDeployments();
      setDeployments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch deployments');
    } finally {
      setLoading(false);
    }
  };

  const refreshDeployments = async (): Promise<void> => {
    await fetchDeployments();
  };

  useEffect(() => {
    fetchDeployments();
  }, []);

  return {
    deployments,
    loading,
    error,
    refreshDeployments
  };
};