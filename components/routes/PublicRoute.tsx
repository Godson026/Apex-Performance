import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface PublicRouteProps {
  children: React.ReactElement;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { currentUser, isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    // Optionally, return a loading spinner here or null
    return null;
  }

  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PublicRoute;