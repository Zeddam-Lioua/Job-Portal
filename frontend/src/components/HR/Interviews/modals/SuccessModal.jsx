import React from "react";
import { Modal, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";

const SuccessModal = ({ show, onHide, message }) => {
  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      className="theme-responsive-modal"
    >
      <Modal.Body className="text-center py-4">
        <FontAwesomeIcon
          icon={faCheckCircle}
          className="text-success mb-3"
          style={{ fontSize: "3rem" }}
        />
        <h4 className="mb-3">{message}</h4>
        <Button variant="primary" onClick={onHide}>
          Close
        </Button>
      </Modal.Body>
    </Modal>
  );
};

export default SuccessModal;
