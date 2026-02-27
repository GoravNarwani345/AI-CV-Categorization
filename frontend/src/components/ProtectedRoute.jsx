import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Loader from "./Loader";

const ProtectedRoute = ({ element, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    return <Navigate to="/getstarted" replace />;
  }

  // Role-based authorization
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // Onboarding check for candidates
  if (user?.role === 'candidate' && !user?.onboardingCompleted) {
    // Only redirect if they aren't already on the onboarding page
    // Actually, App.jsx handles the route, so we just need to decide if we allow 'element'
    // But typical logic is: if candidate and not onboarded, redirect to onboarding.
    // However, if the 'element' IS Onboarding, this would cause a loop.
    // The redirect should be handled more carefully.
    // In the current App.jsx, /onboarding is NOT protected by this specific component logic.
    return <Navigate to="/onboarding" replace />;
  }

  return element;
};

export default ProtectedRoute;
