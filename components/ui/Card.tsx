import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  titleAction?: ReactNode;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className = '', title, titleAction, onClick }) => {
  return (
    <div 
      className={`bg-light-card dark:bg-dark-card shadow-lg dark:border dark:border-dark-border rounded-xl overflow-hidden ${className} ${onClick ? 'cursor-pointer transition-shadow hover:shadow-xl' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => (e.key === 'Enter' || e.key === ' ') && onClick() : undefined}
    >
      {title && (
        <div className="px-4 py-3 sm:px-6 border-b border-light-border dark:border-dark-border flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-light-text dark:text-dark-text">{title}</h3>
          {titleAction && <div>{titleAction}</div>}
        </div>
      )}
      <div className="p-4 sm:p-6">
        {children}
      </div>
    </div>
  );
};

export default Card;