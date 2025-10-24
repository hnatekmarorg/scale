import React, { useState, useMemo, useEffect } from 'react';
import { useDeployments } from '../hooks/useDeployments';
import DeploymentRow from './DeploymentRow';
import api from '../services/api';

interface Deployment {
  namespace: string;
  name: string;
  onReplicas: number;
  offReplicas: number;
  currentReplicas: number;
  labels: Record<string, string>;
}

interface DashboardProps {
  darkMode: boolean;
  setDarkMode: (darkMode: boolean) => void;
}

const Dashboard = ({ darkMode, setDarkMode }: DashboardProps) => {
  const { deployments, loading, error, refreshDeployments } = useDeployments();
  const [filter, setFilter] = useState('');
  const [operationLoading, setOperationLoading] = useState<string | null>(null);
  const [deploymentsList, setDeploymentsList] = useState<Deployment[]>([]);

  useEffect(() => {
    setDeploymentsList(deployments);
  }, [deployments]);

  const filteredDeployments = useMemo(() => {
    if (!filter) return deploymentsList;
    
    const filterLower = filter.toLowerCase();
    return deploymentsList.filter(deployment => {
        const labelString = Object.entries(deployment.labels)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, value]) => `${key}=${value}`)
            .join(' ')
            .toLowerCase();
      
      return (
        deployment.name.toLowerCase().includes(filterLower) ||
        labelString.includes(filterLower)
      );
    });
  }, [deploymentsList, filter]);

const updateDeploymentState = (namespace: string, deployment: string, newState: 'on' | 'off') => {
    setDeploymentsList(prev => prev.map(dep => {
      if (dep.namespace === namespace && dep.name === deployment) {
        const targetReplicas = newState === 'on' ? dep.onReplicas : dep.offReplicas;
        return { ...dep, currentReplicas: targetReplicas };
      }
      return dep;
    }));
  };

  const handleToggle = async (namespace: string, deployment: string, state: 'on' | 'off') => {
    setOperationLoading(`${namespace}/${deployment}`);
    try {
      await api.toggleDeployment(namespace, deployment, state);
      updateDeploymentState(namespace, deployment, state);
      setOperationLoading(null);
    } catch (error) {
      console.error('Toggle failed:', error);
      alert(`Toggle failed: ${(error as Error).message}`);
      setOperationLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          Loading deployments...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <header>
        <h1>SCALE</h1>
        <p className="subtitle">Kubernetes Auto-Scaling via Labels</p>
        <div className="dark-mode-toggle">
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="dark-mode-button"
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>
      </header>

      <div className="filter-bar">
        <input
          type="text"
          className="filter-input"
          placeholder="Filter by label (e.g., app=frontend)"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      <div className="deployment-list">
        {filteredDeployments.length > 0 ? (
          <>
            <table>
              <thead>
                <tr>
                  <th>Deployment</th>
                  <th>Labels</th>
                  <th>Scale</th>
                  <th>Replicas</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeployments.map((deployment) => (
                  <tr key={`${deployment.namespace}-${deployment.name}`}>
                    <DeploymentRow
                      deployment={deployment}
                      onToggle={handleToggle}
                      isLoading={operationLoading === `${deployment.namespace}/${deployment.name}`}
                    />
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <div className="no-data">
            No deployments found with SCALE labels. Add <code>scale.on-replicas</code> and <code>scale.off-replicas</code> to your deployments.
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;