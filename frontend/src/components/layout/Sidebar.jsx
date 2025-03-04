import React from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faBriefcase,
  faChartLine,
  faVideo,
  faSignOutAlt,
  faUser,
  faCog,
  faUsersCog,
  faFileAlt,
  faUserGraduate,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../context/AuthContext";
import LogoIcon from "./LogoIcon";
import NotificationsPanel from "../HR/NotificationsPanel";
import "./Sidebar.css";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  if (user?.user_type !== "human_resources") {
    return null;
  }

  return (
    <div className="sidebar">
      <div className="sidebar-top">
        <LogoIcon />
      </div>
      <div className="sidebar-content">
        <button
          onClick={() => handleNavigation("/admin/hr/dashboard/analytics")}
          className="sidebar-link"
        >
          <FontAwesomeIcon icon={faChartLine} className="me-2" />
          <span className="link-text">Dashboard</span>
        </button>

        <button
          onClick={() => handleNavigation("/admin/hr/dashboard/job-requests")}
          className="sidebar-link"
        >
          <FontAwesomeIcon icon={faFileAlt} className="me-2" />
          <span className="link-text">Job Requests</span>
        </button>

        <button
          onClick={() => handleNavigation("/admin/hr/dashboard/active-posts")}
          className="sidebar-link"
        >
          <FontAwesomeIcon icon={faBriefcase} className="me-2" />
          <span className="link-text">Job Posts</span>
        </button>

        <button
          onClick={() => handleNavigation("/admin/hr/dashboard/resumes")}
          className="sidebar-link"
        >
          <FontAwesomeIcon icon={faUsers} className="me-2" />
          <span className="link-text">Resumes</span>
        </button>

        <button
          onClick={() => handleNavigation("/admin/hr/dashboard/talent-pool")}
          className="sidebar-link"
        >
          <FontAwesomeIcon icon={faUserGraduate} className="me-2" />
          <span className="link-text">Talent Pool</span>
        </button>

        <button
          onClick={() => handleNavigation("/admin/hr/dashboard/interviews")}
          className="sidebar-link"
        >
          <FontAwesomeIcon icon={faVideo} className="me-2" />
          <span className="link-text">Interviews</span>
        </button>

        <div className="sidebar-link notifications-wrapper">
          <NotificationsPanel />
        </div>
      </div>

      <div className="sidebar-bottom">
        <button
          onClick={() => handleNavigation("/admin/hr/dashboard/team")}
          className="sidebar-link"
        >
          <FontAwesomeIcon icon={faUsersCog} className="me-2" />
          <span className="link-text">Team</span>
        </button>

        <button
          onClick={() => handleNavigation("/admin/hr/dashboard/profile")}
          className="sidebar-link"
        >
          <FontAwesomeIcon icon={faUser} className="me-2" />
          <span className="link-text">Profile</span>
        </button>

        <button
          onClick={() => handleNavigation("/admin/hr/dashboard/settings")}
          className="sidebar-link"
        >
          <FontAwesomeIcon icon={faCog} className="me-2" />
          <span className="link-text">Settings</span>
        </button>

        <button onClick={handleLogout} className="sidebar-link">
          <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
          <span className="link-text">Logout</span>
        </button>
      </div>

      <div className="profile-widget">
        <button
          onClick={() => handleNavigation("/admin/hr/dashboard/profile")}
          className="profile-link"
        >
          {user && user.profile_picture ? (
            <img
              src={user.profile_picture}
              alt="Profile"
              className="profile-pic"
            />
          ) : (
            <FontAwesomeIcon icon={faUser} className="profile-icon" />
          )}
          <div className="profile-info">
            <span className="profile-name">
              {user?.first_name} {user?.last_name}
            </span>
            <span className="profile-type">{user?.user_type}</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
