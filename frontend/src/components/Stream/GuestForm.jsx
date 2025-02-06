import React, { useState } from "react";
import { Form, Button, Card, Container } from "react-bootstrap";

const GuestForm = ({ onSubmit }) => {
  const [guestInfo, setGuestInfo] = useState({
    firstName: "",
    lastName: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent default form submission

    // Get existing URL params
    const currentParams = new URLSearchParams(window.location.search);
    const guestId = currentParams.get("guest_id");

    // Update URL with guest info while keeping guest_id
    const newParams = new URLSearchParams();
    newParams.set("guest_id", guestId); // Keep original guest_id
    newParams.set("firstName", guestInfo.firstName);
    newParams.set("lastName", guestInfo.lastName);

    // Update URL without page reload
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}?${newParams}`
    );

    // Pass info to parent
    onSubmit(guestInfo);
  };

  return (
    <Container
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "100vh" }}
    >
      <Card className="shadow-sm" style={{ width: "400px" }}>
        <Card.Body>
          <Card.Title className="text-center mb-4">
            Welcome to the Interview
          </Card.Title>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                required
                value={guestInfo.firstName}
                onChange={(e) =>
                  setGuestInfo({ ...guestInfo, firstName: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                required
                value={guestInfo.lastName}
                onChange={(e) =>
                  setGuestInfo({ ...guestInfo, lastName: e.target.value })
                }
              />
            </Form.Group>
            <Button type="submit" variant="primary" className="w-100">
              Join Interview
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default GuestForm;
