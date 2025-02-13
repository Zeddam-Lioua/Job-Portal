import React from "react";
import { Modal, Button } from "react-bootstrap";

const DeleteMeetingModal = ({ show, onHide, onConfirm, meetingDetails }) => {
  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      className="theme-responsive-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>Confirm Cancellation</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Are you sure you want to cancel this interview?</p>
        <p>
          <strong>Candidate: </strong>
          {meetingDetails?.candidate_email}
        </p>
        <p>
          <strong>Scheduled for: </strong>
          {meetingDetails?.scheduled_time &&
            new Date(meetingDetails.scheduled_time).toLocaleString()}
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          No, Keep it
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          Yes, Cancel Interview
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteMeetingModal;
