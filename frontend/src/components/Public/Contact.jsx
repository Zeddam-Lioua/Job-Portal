// src/components/Public/Contact.jsx
import React, { useState } from "react";
import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMapMarkerAlt,
  faPhone,
  faEnvelope,
  faClock,
} from "@fortawesome/free-solid-svg-icons";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState({ type: "", message: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });

    try {
      // Add your API call here
      // await api.post('/contact', formData);

      setStatus({
        type: "success",
        message: "Thank you for your message. We'll get back to you soon!",
      });
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      setStatus({
        type: "danger",
        message: "Failed to send message. Please try again later.",
      });
      console.error("Error sending message:", error);
    }
  };

  return (
    <Container className="py-5">
      <Row>
        <Col lg={6} className="mb-4 mb-lg-0">
          <h2 className="display-5 fw-bold mb-4">Get in Touch</h2>
          <p className="lead mb-4">
            Have questions about career opportunities at Faderco? We're here to
            help!
          </p>

          <div className="contact-info">
            {[
              {
                icon: faMapMarkerAlt,
                text: "123 Industrial Zone, Algiers, Algeria",
              },
              { icon: faPhone, text: "+213 (0) 23 88 89 12" },
              { icon: faEnvelope, text: "contact@faderco.dz" },
              { icon: faClock, text: "Mon - Fri: 9:00 AM - 5:00 PM" },
            ].map((item, index) => (
              <div key={index} className="d-flex align-items-center mb-3">
                <FontAwesomeIcon
                  icon={item.icon}
                  className="text-primary me-3"
                />
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </Col>

        <Col lg={6}>
          <div className="contact-form-wrapper p-4 bg-white rounded shadow-sm">
            {status.message && (
              <Alert variant={status.type} className="mb-4">
                {status.message}
              </Alert>
            )}
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Subject</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  required
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Message</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  required
                />
              </Form.Group>

              <Button variant="primary" type="submit" className="w-100">
                Send Message
              </Button>
            </Form>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Contact;
