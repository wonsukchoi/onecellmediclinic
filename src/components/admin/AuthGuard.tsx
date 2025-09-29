import React, { useContext } from 'react';
import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import AdminContext from '../../contexts/AdminContext';

interface AuthGuardProps {
  children: ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const context = useContext(AdminContext);
  const location = useLocation();

  // If context is not available, redirect to login
  if (!context) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  const { isAuthenticated, loading } = context;

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page, but remember where they were trying to go
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;