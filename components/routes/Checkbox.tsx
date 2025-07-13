
import React from 'react';
import { ICONS } from '../../constants'; // Assuming CHECK_SQUARE_FILLED and CHECK_SQUARE_EMPTY are here

interface CheckboxProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  wrapperClassName?: string;
  labelClassName?: string; 
}

const Checkbox: React.FC<CheckboxProps> = ({ id, label, checked, onChange, wrapperClassName = '', labelClassName = '' }) => {
  return (
    <div className={`flex items-center ${wrapperClassName}`}>
      <input
        id={id}
        type="checkbox"
        className="sr-only" // Hide default checkbox
        checked={checked}
        onChange={onChange}
      />
      <label 
        htmlFor={id} 
        className={`flex items-center cursor-pointer text-sm ${labelClassName || 'text-light-text-secondary dark:text-dark-text-secondary'}`}
      >
        {checked ? 
            <ICONS.CHECK_SQUARE_FILLED className="w-4 h-4 text-primary-DEFAULT mr-2" /> :
            <ICONS.CHECK_SQUARE_EMPTY className="w-4 h-4 text-slate-400 dark:text-slate-500 mr-2" />
        }
        {label}
      </label>
    </div>
  );
};

export default Checkbox;