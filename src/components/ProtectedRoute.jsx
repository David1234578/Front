import { Navigate, useLocation } from 'react-router-dom';

import useAuth from '../hooks/useAuth';

function ProtectedRoute({ children, requiredRole = null }) {
  const { isAuthenticated, currentUser } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (requiredRole && currentUser?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;