import React, { useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";

const JoinMeetingModal = ({ show, onHide, onJoin }) => {
  const [meetingId, setMeetingId] = useState("");
  const [error, setError] = useState("");

  const handleJoin = () => {
    if (!meetingId.trim()) {
      setError("Please enter a meeting ID");
      return;
    }
    onJoin(meetingId);
    setMeetingId("");
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} className="theme-responsive-modal">
      <Modal.Header closeButton>
        <Modal.Title>Join Interview</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Meeting ID</Form.Label>
            <Form.Control
              type="text"
              value={meetingId}
              onChange={(e) => setMeetingId(e.target.value)}
              placeholder="Enter meeting ID"
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleJoin}>
          Join
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default JoinMeetingModal;
