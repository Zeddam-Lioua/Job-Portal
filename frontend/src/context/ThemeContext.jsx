import React, { createContext, useState, useContext, useEffect } from "react";

const ThemeContext = createContext();

export const themes = {
  light: {
    name: "light",
    background: "#ffffff",
    surface: "#f8f9fa",
    primary: "#007bff",
    text: "#343a40",
    textSecondary: "#6c757d",
    border: "#dee2e6",
    logo: "#0047BA",
  },
  dark: {
    name: "dark",
    background: "#2c2f33",
    surface: "#343a40",
    primary: "#007bff",
    text: "#ffffff",
    textSecondary: "#b0b3b8",
    border: "#444444",
    logo: "#007bff",
  },
  blue: {
    name: "blue",
    background: "#1a237e",
    surface: "#283593",
    primary: "#3949ab",
    text: "#ffffff",
    textSecondary: "#c5cae9",
    border: "#3f51b5",
    logo: "#ffffff",
  },
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(themes.light);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(themes[savedTheme]);
      applyTheme(themes[savedTheme]);
    }
  }, []);

  const applyTheme = (theme) => {
    document.documentElement.style.setProperty(
      "--background",
      theme.background
    );
    document.documentElement.style.setProperty("--surface", theme.surface);
    document.documentElement.style.setProperty("--primary", theme.primary);
    document.documentElement.style.setProperty("--text", theme.text);
    document.documentElement.style.setProperty(
      "--text-secondary",
      theme.textSecondary
    );
    document.documentElement.style.setProperty("--border", theme.border);

    // Add or remove dark class from body
    if (theme.name === "dark") {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  };

  const changeTheme = (themeName) => {
    const newTheme = themes[themeName];
    setCurrentTheme(newTheme);
    localStorage.setItem("theme", themeName);
    applyTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, changeTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

export default ThemeContext;
