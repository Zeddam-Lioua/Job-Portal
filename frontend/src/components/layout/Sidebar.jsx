import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileAlt,
  faUsers,
  faBriefcase,
  faChartLine,
  faVideo,
  faSignOutAlt,
  faUser,
  faCog,
  faBell,
  faUsersCog,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../context/AuthContext";
import LogoIcon from "./LogoIcon";
import "./Sidebar.css";

const Sidebar = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
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
        <Link to="/admin/hr/dashboard/analytics" className="sidebar-link">
          <FontAwesomeIcon icon={faChartLine} className="me-2" />
          <span className="link-text">Dashboard</span>
        </Link>
        <Link to="/admin/hr/dashboard/job-requests" className="sidebar-link">
          <FontAwesomeIcon icon={faFileAlt} className="me-2" />
          <span className="link-text">Job Requests</span>
        </Link>
        <Link to="/admin/hr/dashboard/resumes" className="sidebar-link">
          <FontAwesomeIcon icon={faUsers} className="me-2" />
          <span className="link-text">Resumes</span>
        </Link>
        <Link to="/admin/hr/dashboard/active-posts" className="sidebar-link">
          <FontAwesomeIcon icon={faBriefcase} className="me-2" />
          <span className="link-text">Job Posts</span>
        </Link>
        <Link to="/admin/hr/dashboard/interviews" className="sidebar-link">
          <FontAwesomeIcon icon={faVideo} className="me-2" />
          <span className="link-text">Interviews</span>
        </Link>
        <Link to="/admin/hr/dashboard/notifications" className="sidebar-link">
          <FontAwesomeIcon icon={faBell} className="me-2" />
          <span className="link-text">Notifications</span>
        </Link>
      </div>
      <div className="sidebar-bottom">
        <div className="separator"></div>
        <Link to="/admin/hr/dashboard/team" className="sidebar-link">
          <FontAwesomeIcon icon={faUsersCog} className="me-2" />
          <span className="link-text">Team</span>
        </Link>
        <Link to="/admin/hr/dashboard/profile" className="sidebar-link">
          <FontAwesomeIcon icon={faUser} className="me-2" />
          <span className="link-text">Profile</span>
        </Link>
        <Link to="/admin/hr/dashboard/settings" className="sidebar-link">
          <FontAwesomeIcon icon={faCog} className="me-2" />
          <span className="link-text">Settings</span>
        </Link>
        <Link to="/admin/login" className="sidebar-link" onClick={handleLogout}>
          <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
          <span className="link-text">Logout</span>
        </Link>
      </div>
      <div className="profile-widget">
        <Link to="/admin/hr/dashboard/profile" className="profile-link">
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
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
