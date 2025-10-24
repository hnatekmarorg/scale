import React from 'react';
import Toggle from './Toggle';

interface Deployment {
  namespace: string;
  name: string;
  onReplicas: number;
  offReplicas: number;
  currentReplicas: number;
  labels: Record<string, string>;
}

interface DeploymentRowProps {
  deployment: Deployment;
  onToggle: (namespace: string, deployment: string, state: 'on' | 'off') => void;
  isLoading: boolean;
}

const DeploymentRow = ({ deployment, onToggle, isLoading }: DeploymentRowProps) => {
  const isActive = deployment.currentReplicas === deployment.onReplicas;
  
  const handleToggle = (newState: boolean) => {
    onToggle(deployment.namespace, deployment.name, newState ? 'on' : 'off');
  };

  const renderLabels = () => {
    return Object.entries(deployment.labels).map(([key, value]) => (
      <span key={key} className="label">
        {key}={value}
      </span>
    ));
  };

  return (
    <>
      <td className="deployment-name">{deployment.name}</td>
      <td>
        <div className="labels">
          {renderLabels()}
        </div>
      </td>
      <td>
        <div className="toggle-container">
          <Toggle 
            isActive={isActive} 
            onToggle={handleToggle}
            disabled={isLoading}
          />
          <span className="tooltip">ⓘ</span>
        </div>
      </td>
      <td className="replica-count">
        {deployment.currentReplicas} replicas
      </td>
    </>
  );
};

export default DeploymentRow;