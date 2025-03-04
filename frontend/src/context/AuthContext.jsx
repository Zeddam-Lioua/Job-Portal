import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";
import authService from "../services/auth.service";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      fetchUserProfile()
        .then((userData) => {
          setUser(userData);
          setIsAuthenticated(true);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Profile fetch failed:", error);
          localStorage.removeItem("accessToken");
          setUser(null);
          setIsAuthenticated(false);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await authService.getCurrentUser();
      if (!response || !response.data) {
        throw new Error("Invalid response structure");
      }
      return response.data;
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      throw error;
    }
  };

  const updateUser = async (data) => {
    try {
      const updatedUser = await authService.updateUser(data);
      setUser(updatedUser);
    } catch (error) {
      console.error("Failed to update user:", error);
      throw error;
    }
  };

  const sendPasswordChangeEmail = async (email) => {
    try {
      await authService.sendPasswordChangeEmail(email);
    } catch (error) {
      console.error("Failed to send password change email:", error);
      throw error;
    }
  };

  const login = async ({ email, password }) => {
    try {
      const response = await api.post("/login/", { email, password });

      if (response.data.tokens) {
        localStorage.setItem("accessToken", response.data.tokens.access);
        const userData = await fetchUserProfile();
        // Make sure profile picture URL is complete
        if (
          userData.profile_picture &&
          !userData.profile_picture.startsWith("http")
        ) {
          userData.profile_picture = `${API_URL}${userData.profile_picture}`;
        }
        setUser(userData);
        setIsAuthenticated(true);
        return userData;
      }
      throw new Error("Invalid response structure");
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const googleLogin = async (credential) => {
    try {
      const response = await authService.googleLogin(credential);
      if (response?.access) {
        // Set the token in axios default headers
        api.defaults.headers.common["Authorization"] = `JWT ${response.access}`;

        // Store tokens and user data
        localStorage.setItem("accessToken", response.access);
        localStorage.setItem("refreshToken", response.refresh);

        if (response.user) {
          setUser(response.user);
          setIsAuthenticated(true);
          localStorage.setItem("user", JSON.stringify(response.user));
        }

        return response;
      }
      throw new Error("No access token received");
    } catch (error) {
      console.error("Google login error:", error);
      throw error;
    }
  };

  const register = async ({ email, password }) => {
    try {
      await api.post("/register/", { email, password });
      await login({ email, password });
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
    setIsAuthenticated(false);
  };

  const uploadProfilePicture = async (formData) => {
    const updatedUser = await authService.uploadProfilePicture(formData);
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        updateUser,
        sendPasswordChangeEmail,
        isAuthenticated,
        login,
        googleLogin,
        register,
        logout,
        loading,
        uploadProfilePicture,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
