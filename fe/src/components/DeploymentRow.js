import React from 'react';
import Toggle from './Toggle';

const DeploymentRow = ({ deployment, onToggle }) => {
  const isActive = deployment.currentReplicas === deployment.onReplicas;
  
  const handleToggle = (newState) => {
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