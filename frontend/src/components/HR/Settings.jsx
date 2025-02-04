import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPalette } from "@fortawesome/free-solid-svg-icons";
import { useTheme, themes } from "../../context/ThemeContext.jsx";
import "./styles/Settings.css";

const Settings = () => {
  const { currentTheme, changeTheme } = useTheme();

  return (
    <div className="settings">
      <h2>Settings</h2>
      <div className="theme-section">
        <h3>
          <FontAwesomeIcon icon={faPalette} className="me-2" />
          Theme Selection
        </h3>
        <div className="theme-options">
          {Object.keys(themes).map((themeName) => (
            <button
              key={themeName}
              className={`theme-button ${
                currentTheme.name === themeName ? "active" : ""
              }`}
              onClick={() => changeTheme(themeName)}
              style={{
                backgroundColor: themes[themeName].surface,
                color: themes[themeName].text,
                border: `2px solid ${themes[themeName].border}`,
              }}
            >
              {themeName.charAt(0).toUpperCase() + themeName.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Settings;
