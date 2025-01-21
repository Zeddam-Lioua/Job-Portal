import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from '../../context/AuthContext';

const RoleRoutes = ({ children }) => {
    const { user } = useAuth(); // Get user from context

    // Check if user is defined before accessing user_type
    if (!user) {
        return <Navigate to="/login" />;
    }

    if (user.user_type === "human_resources") {
        return <Navigate to="/hr/dashboard" />;
    }
    if (user.user_type === "district_manager") {
        return <Navigate to="/dm/dashboard" />;
    }

    return children; // Public route
};

export default RoleRoutes;