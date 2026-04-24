import { Navigate, useLocation } from 'react-router-dom';

import useAuth from '../hooks/useAuth';

function AdminRoute({ children }) {
  const { isAdmin, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!isAdmin) {
    return <Navigate to="/access-denied" replace state={{ from: location.pathname }} />;
  }

  return children;
}

export default AdminRoute;
