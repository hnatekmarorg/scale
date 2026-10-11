import { useState, useEffect } from 'react';
import api from '../services/api';

interface Deployment {
  namespace: string;
  name: string;
  onReplicas: number;
  offReplicas: number;
  currentReplicas: number;
  readyReplicas: number;
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

  // While any deployment is on but not yet ready (a model load takes minutes), poll so the
  // row's ready count catches up without a manual refresh.
  useEffect(() => {
    const starting = deployments.some(
      (d) => d.currentReplicas > 0 && d.readyReplicas < d.currentReplicas
    );
    if (!starting) return;
    const timer = setInterval(fetchDeployments, 5000);
    return () => clearInterval(timer);
  }, [deployments]);

  return {
    deployments,
    loading,
    error,
    refreshDeployments
  };
};