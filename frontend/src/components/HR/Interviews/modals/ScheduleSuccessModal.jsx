import React from "react";
import { Modal, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";

const ScheduleSuccessModal = ({ show, onHide, scheduledTime }) => {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Interview Scheduled</Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center py-4">
        <FontAwesomeIcon
          icon={faCheckCircle}
          style={{
            fontSize: "3rem",
            color: "#28a745",
            marginBottom: "1rem",
          }}
        />
        <h5>Interview Successfully Scheduled!</h5>
        <p className="text-muted">
          The interview has been scheduled for:
          <br />
          <strong>{new Date(scheduledTime).toLocaleString()}</strong>
        </p>
        <p className="small text-muted mt-3">
          An email notification has been sent to the candidate.
        </p>
      </Modal.Body>
    </Modal>
  );
};

export default ScheduleSuccessModal;
