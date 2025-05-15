import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import React from 'react';

function ProtectedRoute({ requiredRole = 1 }) {
  const auth = useSelector(state => state.auth);
  const location = useLocation();
  const userRole = auth.role;

  if (!auth.daDangNhap) {
    return <Navigate to="/auth" state={{ from: location }} />;
  }

  // Nếu requiredRole là 1 (admin) thì chỉ cho phép admin (role === 1)
  if (requiredRole === 1 && userRole !== 1) {
    return <Navigate to="/" state={{ from: location }} />;
  }

  // Nếu requiredRole là 0 (user) thì cho phép cả user và admin
  if (requiredRole === 0 && (userRole !== 0 && userRole !== 1)) {
    return <Navigate to="/" state={{ from: location }} />;
  }

  return <Outlet />;
}

export default ProtectedRoute;