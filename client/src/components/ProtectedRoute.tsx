import React from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  element: any;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element }) => {
  const token: string | null = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return element;
};

export default ProtectedRoute;