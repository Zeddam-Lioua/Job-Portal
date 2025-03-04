// src/components/Public/About.jsx
import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHistory,
  faBullseye,
  faAward,
  faUsers,
  faIndustry,
  faHandshake,
} from "@fortawesome/free-solid-svg-icons";
import NavLogo from "../layout/NavLogo";
import "./styles/Home.css";

const About = () => {
  return (
    <Container className="py-5">
      <div className="text-center mb-5">
        <NavLogo
          color="#007bff"
          className="about-logo"
          linkTo="#" // Disable navigation in About page
        />
        <h1 className="fw-bold">About Us</h1>
        <p className="lead text-muted">
          Leading the Way in Innovation and Excellence
        </p>
      </div>

      <Row className="mb-5">
        <Col md={6}>
          <div className="about-content pe-md-5">
            <h2 className="mb-4">Our Story</h2>
            <p className="lead">
              Founded in 1986, Faderco has grown from a small local business to
              one of Algeria's leading manufacturers of hygiene products.
            </p>
            <p>
              Today, we employ over 3,000 professionals across multiple
              facilities, serving millions of customers with high-quality
              personal care and hygiene products.
            </p>
          </div>
        </Col>
        <Col md={6}>
          <img
            src="/images/company-building.jpg"
            alt="Faderco Headquarters"
            className="img-fluid rounded shadow-lg"
          />
        </Col>
      </Row>

      <Row className="gy-4 mb-5">
        {[
          {
            icon: faBullseye,
            title: "Our Mission",
            content:
              "To provide innovative hygiene solutions that improve people's lives while maintaining sustainable practices.",
          },
          {
            icon: faHistory,
            title: "Our Legacy",
            content:
              "35+ years of excellence in manufacturing and distribution of hygiene products.",
          },
          {
            icon: faAward,
            title: "Recognition",
            content:
              "Multiple industry awards for product quality and innovation.",
          },
        ].map((item, index) => (
          <Col md={4} key={index}>
            <Card className="h-100 border-0 shadow-sm hover-card">
              <Card.Body className="text-center p-4">
                <FontAwesomeIcon
                  icon={item.icon}
                  className="mb-3 text-primary"
                  size="3x"
                />
                <h3 className="h4 mb-3">{item.title}</h3>
                <p className="text-muted">{item.content}</p>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default About;
