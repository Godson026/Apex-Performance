
import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  wrapperClassName?: string;
  options: { value: string | number; label: string }[];
  placeholder?: string; 
}

const Select: React.FC<SelectProps> = ({ 
  label, 
  id, 
  error, 
  className = '', 
  wrapperClassName = '', 
  options, 
  placeholder, 
  value,       
  ...restProps 
}) => {
  const baseSelectClasses = "block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm transition-colors duration-150";
  const lightModeClasses = "bg-light-card border-light-border text-light-text focus:ring-primary-DEFAULT focus:border-primary-DEFAULT";
  const darkModeClasses = "dark:bg-dark-card dark:border-dark-border dark:text-dark-text dark:focus:ring-primary-light dark:focus:border-primary-light";

  // If a value is selected, use standard text colors. If not (placeholder is shown), rely on global ::placeholder or option styling.
  const valueSpecificColorClass = (value === "" || value === undefined) 
    ? "text-slate-500 dark:text-slate-400" // Mimics placeholder color if no value
    : "text-light-text dark:text-dark-text";


  return (
    <div className={`mb-4 ${wrapperClassName}`}>
      {label && <label htmlFor={id} className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">{label}</label>}
      <select
        id={id}
        className={`${baseSelectClasses} ${lightModeClasses} ${darkModeClasses} ${error ? 'border-danger focus:ring-danger focus:border-danger' : ''} ${valueSpecificColorClass} ${className}`}
        value={value} 
        {...restProps} 
      >
        {/* The placeholder option relies on global ::placeholder for its appearance if the select itself is unselected */}
        {placeholder && <option value="" disabled className="text-slate-500 dark:text-slate-400">{placeholder}</option>}
        {options.map(option => (
          <option key={option.value} value={option.value} className="text-light-text bg-light-card dark:text-dark-text dark:bg-dark-card">{option.label}</option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
};

export default Select;