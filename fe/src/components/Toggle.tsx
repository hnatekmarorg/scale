import React from 'react';

interface ToggleProps {
  isActive: boolean;
  onToggle: (isActive: boolean) => void;
  disabled?: boolean;
}

const Toggle = ({ isActive, onToggle, disabled = false }: ToggleProps) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      onToggle(!isActive);
    }
  };

  return (
    <div 
      className={`toggle ${isActive ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
      onClick={handleClick}
      style={{
        position: 'relative',
        width: '50px',
        height: '25px',
        background: isActive ? 'var(--success)' : 'var(--gray)',
        borderRadius: '15px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background 0.2s',
        userSelect: 'none'
      }}
    >
      <div 
        className="toggle-slider"
        style={{
          position: 'absolute',
          top: '2px',
          left: isActive ? '28px' : '2px',
          width: '21px',
          height: '21px',
          background: 'white',
          borderRadius: '50%',
          transition: 'transform 0.2s'
        }}
      />
    </div>
  );
};

export default Toggle;