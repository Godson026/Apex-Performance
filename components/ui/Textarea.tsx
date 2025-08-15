
import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  wrapperClassName?: string;
  helperText?: string;
}

const Textarea: React.FC<TextareaProps> = ({ label, id, error, className = '', wrapperClassName = '', helperText, ...props }) => {
  const baseTextareaClasses = "block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm transition-colors duration-150";
  // Removed placeholder-slate-400 from lightModeClasses, dark:placeholder-slate-500 from darkModeClasses
  const lightModeClasses = "bg-light-card border-light-border text-light-text focus:ring-primary-DEFAULT focus:border-primary-DEFAULT";
  const darkModeClasses = "dark:bg-dark-card dark:border-dark-border dark:text-dark-text dark:focus:ring-primary-light dark:focus:border-primary-light";

  return (
    <div className={`mb-4 ${wrapperClassName}`}>
      {label && <label htmlFor={id} className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">{label}</label>}
      <textarea
        id={id}
        className={`${baseTextareaClasses} ${lightModeClasses} ${darkModeClasses} ${error ? 'border-danger focus:ring-danger focus:border-danger' : ''} ${className}`}
        rows={4}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
      {helperText && !error && <p className="mt-1 text-xs text-light-text-secondary dark:text-dark-text-secondary">{helperText}</p>}
    </div>
  );
};

export default Textarea;