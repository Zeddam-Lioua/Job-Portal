import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

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
      const response = await api.get("/user/");
      console.log("User profile response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
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

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, login, register, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
