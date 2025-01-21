import React from "react";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faSignInAlt,
  faUserPlus,
  faBriefcase,
  faUser,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../context/AuthContext";
import "./Navbar.css";

const Navigation = () => {
  const { isAuthenticated, userType, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const renderAuthLinks = () => {
    if (isAuthenticated) {
      return (
        <div className="d-flex align-items-center">
          <div className="user-profile-section">
            <div className="d-flex align-items-center">
              {user && user.profile_picture ? (
                <img
                  src={user.profile_picture}
                  alt="Profile"
                  className="nav-profile-pic"
                />
              ) : (
                <FontAwesomeIcon icon={faUser} className="nav-profile-icon" />
              )}
              <span className="username">{user?.username}</span>
            </div>
            <Button
              variant="outline-light"
              onClick={handleLogout}
              className="logout-btn ms-3"
            >
              <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
              Logout
            </Button>
          </div>
        </div>
      );
    } else if (location.pathname.startsWith("/admin")) {
      return (
        <>
          <Nav.Link
            as={Link}
            to="/admin/login"
            className={location.pathname === "/admin/login" ? "active" : ""}
          >
            <FontAwesomeIcon icon={faSignInAlt} className="me-2" />
            Login
          </Nav.Link>
          <Nav.Link
            as={Link}
            to="/admin/register"
            className={location.pathname === "/admin/register" ? "active" : ""}
          >
            <FontAwesomeIcon icon={faUserPlus} className="me-2" />
            Register
          </Nav.Link>
        </>
      );
    }
    return null;
  };

  return (
    <Navbar expand="lg" className="modern-navbar" variant="dark">
      <Container>
        <Navbar.Brand as={Link} to="/" className="brand-text">
          <FontAwesomeIcon icon={faBriefcase} className="me-2" />
          Job Portal
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link
              as={Link}
              to="/"
              className={location.pathname === "/" ? "active" : ""}
            >
              <FontAwesomeIcon icon={faHome} className="me-2" />
              Home
            </Nav.Link>
          </Nav>
          <Nav>{renderAuthLinks()}</Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;
