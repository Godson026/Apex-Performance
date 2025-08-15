
import React from 'react';

interface ToggleSwitchProps {
  isOn: boolean;
  handleToggle: () => void;
  onIcon?: React.ReactNode;
  offIcon?: React.ReactNode;
  label?: string;
  id: string; // Added id prop
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ isOn, handleToggle, onIcon, offIcon, label, id }) => {
  return (
    <label htmlFor={id} className="flex items-center cursor-pointer">
      {label && <span className="mr-3 text-sm font-medium text-light-text dark:text-dark-text">{label}</span>}
      <div className="relative">
        <input type="checkbox" id={id} className="sr-only" checked={isOn} onChange={handleToggle} />
        <div className={`block w-14 h-8 rounded-full transition-colors duration-300 ease-in-out ${isOn ? 'bg-primary-DEFAULT' : 'bg-gray-300 dark:bg-slate-600'}`}></div>
        <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-300 ease-in-out ${isOn ? 'transform translate-x-6' : ''}`}>
          {isOn && onIcon ? <span className="flex items-center justify-center h-full text-primary-DEFAULT">{onIcon}</span> : null}
          {!isOn && offIcon ? <span className="flex items-center justify-center h-full text-slate-500">{offIcon}</span> : null}
        </div>
      </div>
    </label>
  );
};

export default ToggleSwitch;
