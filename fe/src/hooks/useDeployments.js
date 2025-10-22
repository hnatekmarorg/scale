import { useState, useEffect } from 'react';
import api from '../services/api';

export const useDeployments = () => {
  const [deployments, setDeployments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDeployments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getDeployments();
      setDeployments(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch deployments');
    } finally {
      setLoading(false);
    }
  };

  const refreshDeployments = async () => {
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