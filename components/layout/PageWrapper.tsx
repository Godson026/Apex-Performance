
import React, { ReactNode } from 'react';

interface PageWrapperProps {
  children: ReactNode;
}

const PageWrapper: React.FC<PageWrapperProps> = ({ children }) => {
  return (
    <div className="container mx-auto max-w-7xl">
      {children}
    </div>
  );
};

export default PageWrapper;
