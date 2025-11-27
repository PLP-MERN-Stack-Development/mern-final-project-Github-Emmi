// frontend/src/components/RoleRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const RoleRoute = ({ children, allowedRoles }) => {
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard
    switch (user.role) {
      case 'student':
        return <Navigate to="/student/dashboard" replace />;
      case 'tutor':
        return <Navigate to="/tutor/dashboard" replace />;
      case 'admin':
      case 'superadmin':
        return <Navigate to="/admin/dashboard" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default RoleRoute;
