import React from "react";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSignInAlt,
  faUserPlus,
  faUser,
  faSignOutAlt,
  faBriefcase,
  faGraduationCap,
  faInfoCircle,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../context/AuthContext";
import "./Navbar.css";
import NavLogo from "./NavLogo";

const Navigation = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  // Early return conditions - Hide navbar for these cases
  if (
    // Hide for HR dashboard
    (user?.user_type === "human_resources" &&
      location.pathname.includes("/admin/hr/dashboard")) ||
    // Hide for guest interview and interview ended pages
    location.pathname.includes("/guest/interview/") ||
    location.pathname.includes("/interview-ended")
  ) {
    return null;
  }

  const renderAuthLinks = () => {
    if (isAuthenticated) {
      return (
        <div className="d-flex align-items-center">
          <Link to="/admin/hr/dashboard/profile">
            {user && user.profile_picture ? (
              <img
                src={user.profile_picture}
                alt="Profile"
                className="nav-profile-pic"
              />
            ) : (
              <FontAwesomeIcon icon={faUser} className="nav-profile-icon" />
            )}
          </Link>
          <Button
            variant="outline-light"
            onClick={handleLogout}
            className="logout-btn ms-3"
          >
            <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
            Logout
          </Button>
        </div>
      );
    } else if (location.pathname.startsWith("/admin")) {
      return (
        // Login/Register links for admin section
        <>
          <Nav.Link as={Link} to="/admin/login">
            <FontAwesomeIcon icon={faSignInAlt} className="me-2" />
            Login
          </Nav.Link>
          <Nav.Link as={Link} to="/admin/register">
            <FontAwesomeIcon icon={faUserPlus} className="me-2" />
            Register
          </Nav.Link>
        </>
      );
    }
    return null;
  };

  const renderPublicLinks = () => {
    if (!location.pathname.startsWith("/admin")) {
      return (
        <>
          <Nav.Link as={Link} to="/job-list">
            <FontAwesomeIcon icon={faBriefcase} className="me-2" />
            Jobs
          </Nav.Link>

          <Nav.Link as={Link} to="/career-resources">
            <FontAwesomeIcon icon={faGraduationCap} className="me-2" />
            Career Resources
          </Nav.Link>

          <Nav.Link as={Link} to="/about">
            <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
            About Us
          </Nav.Link>

          <Nav.Link as={Link} to="/contact">
            <FontAwesomeIcon icon={faEnvelope} className="me-2" />
            Contact
          </Nav.Link>
        </>
      );
    }
    return null;
  };

  return (
    <Navbar expand="lg" className="modern-navbar" variant="dark">
      <Container>
        <Navbar.Brand>
          <NavLogo color="#ffffff" linkTo="/" />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">{renderPublicLinks()}</Nav>
          <Nav className="ms-auto">{renderAuthLinks()}</Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;
