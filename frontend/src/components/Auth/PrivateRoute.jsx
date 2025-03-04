import React from "react";
import { Navigate } from "react-router-dom";
import PropTypes from "prop-types";
import { useAuth } from "../../context/AuthContext";
import { useLocation } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/admin/login" />;
  }

  // Check HR routes
  if (
    location.pathname.includes("/admin/hr/") &&
    user.user_type !== "human_resources"
  ) {
    return <Navigate to="/" />;
  }

  // Check DM routes
  if (
    location.pathname.includes("/admin/dm/") &&
    user.user_type !== "district_manager"
  ) {
    return <Navigate to="/" />;
  }

  return children;
};

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default PrivateRoute;
