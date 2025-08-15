
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  wrapperClassName?: string;
  labelClassName?: string; 
  helperText?: string;
  icon?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({ label, id, error, className = '', wrapperClassName = '', labelClassName = '', helperText, icon, ...props }) => {
  const baseInputClasses = "block w-full border rounded-md shadow-sm focus:outline-none sm:text-sm transition-colors duration-150";
  // Removed placeholder-slate-400 from lightModeClasses, dark:placeholder-slate-500 from darkModeClasses
  const lightModeClasses = "bg-light-card border-light-border text-light-text focus:ring-primary-DEFAULT focus:border-primary-DEFAULT";
  const darkModeClasses = "dark:bg-slate-700 dark:border-slate-600 dark:text-dark-text dark:focus:ring-primary-light dark:focus:border-primary-light";
  
  const paddingClasses = icon ? "pl-10 pr-3 py-2" : "px-3 py-2";

  return (
    <div className={`mb-4 ${wrapperClassName}`}>
      {label && <label htmlFor={id} className={`block text-sm font-medium mb-1 ${labelClassName || 'text-light-text dark:text-dark-text'}`}>{label}</label>}
      <div className="relative">
        {icon && React.isValidElement(icon) && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {React.cloneElement(icon as React.ReactElement<any>, { className: "h-5 w-5 text-gray-400 dark:text-slate-500" })}
          </div>
        )}
        <input
          id={id}
          className={`${baseInputClasses} ${paddingClasses} ${lightModeClasses} ${darkModeClasses} ${error ? 'border-danger focus:ring-danger focus:border-danger' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
      {helperText && !error && <p className="mt-1 text-xs text-light-text-secondary dark:text-dark-text-secondary">{helperText}</p>}
    </div>
  );
};

export default Input;