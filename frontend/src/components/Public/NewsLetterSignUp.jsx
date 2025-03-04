import React, { useState } from "react";
import { Row, Col, Form, Button, Alert } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";

const NewsletterSignup = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({
      type: "success",
      message: "Thank you for subscribing to our newsletter!",
    });
    setEmail("");
  };

  return (
    <Row className="justify-content-center">
      <Col md={8} lg={6}>
        <div className="text-center mb-4">
          <h3>Stay Updated</h3>
          <p>Subscribe to receive job alerts and career tips</p>
        </div>
        {status.message && (
          <Alert variant={status.type} className="mb-3">
            {status.message}
          </Alert>
        )}
        <Form onSubmit={handleSubmit}>
          <div className="d-flex">
            <Form.Control
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="me-2"
            />
            <Button type="submit" variant="light">
              <FontAwesomeIcon icon={faEnvelope} className="me-2" />
              Subscribe
            </Button>
          </div>
        </Form>
      </Col>
    </Row>
  );
};

export default NewsletterSignup;
