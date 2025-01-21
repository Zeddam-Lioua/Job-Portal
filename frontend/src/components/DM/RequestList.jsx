import React from 'react';
import { Container, Row, Col, Card, Alert, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import './styles/DM.css';

const RequestList = ({ requests }) => {
    const getStatusVariant = (status) => {
        switch (status) {
            case 'pending':
                return 'warning';
            case 'approved':
                return 'success';
            case 'rejected':
                return 'danger';
            default:
                return 'secondary';
        }
    };

    return (
        <Container className="py-4">
            <h2 className="mb-4">My Job Requests</h2>
            {requests.length === 0 ? (
                <Alert variant="info">No requests found. Create a new one!</Alert>
            ) : (
                <Row>
                    {requests.map((request) => (
                        <Col md={4} key={request.id} className="mb-4">
                            <Card className="h-100 shadow-sm position-relative">
                                <Card.Body className="d-flex flex-column">
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <Card.Title>{request.field}</Card.Title>
                                        <Badge bg={getStatusVariant(request.status)}>{request.status}</Badge>
                                    </div>
                                    <Card.Text as="div" className="flex-grow-1">
                                        <div><strong>Required Employees:</strong> {request.required_employees}</div>
                                        <div><strong>Experience Level:</strong> {request.experience_level}</div>
                                        <div><strong>Education Level:</strong> {request.education_level}</div>
                                        <div><strong>Workplace:</strong> {request.workplace}</div>
                                    </Card.Text>
                                    <div className="d-flex justify-content-between align-items-center mt-3">
                                        <Link to={`/admin/dm/dashboard/requests/${request.id}`} className="btn btn-outline-primary">
                                            <FontAwesomeIcon icon={faFileAlt} className="me-2" />
                                            View Request
                                        </Link>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </Container>
    );
};

export default RequestList;