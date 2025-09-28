import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useMember } from '../../contexts/MemberContext';

interface MemberProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

const MemberProtectedRoute: React.FC<MemberProtectedRouteProps> = ({
  children,
  redirectTo = '/member/login'
}) => {
  const { member, loading } = useMember();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontFamily: '"Noto Sans KR", sans-serif'
      }}>
        <div style={{
          textAlign: 'center'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f4f6',
            borderTop: '4px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#6b7280', margin: 0 }}>인증 확인 중...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!member) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Render protected content
  return <>{children}</>;
};

export default MemberProtectedRoute;