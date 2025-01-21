import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, InputGroup, Badge, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFilter, faUser, faBriefcase, faCalendar } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import hrService from '../../services/hr.service';
import './styles/Resume.css';

const Resumes = () => {
    const [resumes, setResumes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');

    useEffect(() => {
        fetchResumes();
    }, [filter, sortBy]);

    const fetchResumes = async () => {
        try {
            const response = await hrService.getResumes({ status: filter, sort: sortBy });
            setResumes(response.data);
        } catch (err) {
            setError('Failed to fetch resumes');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadgeVariant = (status) => {
        const variants = {
            pending: 'warning',
            sent: 'info',
            accepted: 'success',
            rejected: 'danger'
        };
        return variants[status] || 'secondary';
    };

    const filteredResumes = resumes.filter(resume => 
        resume.applicant.toLowerCase().includes(search.toLowerCase()) ||
        resume.job_post_name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Container fluid className="py-4">
            <Row className="mb-4">
                <Col>
                    <h2 className="mb-4">Resume Management</h2>
                    <Row className="g-3">
                        <Col md={4}>
                            <InputGroup>
                                <InputGroup.Text>
                                    <FontAwesomeIcon icon={faSearch} />
                                </InputGroup.Text>
                                <Form.Control
                                    placeholder="Search resumes..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </InputGroup>
                        </Col>
                        <Col md={4}>
                            <Form.Select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="sent">Sent</option>
                                <option value="accepted">Accepted</option>
                                <option value="rejected">Rejected</option>
                            </Form.Select>
                        </Col>
                        <Col md={4}>
                            <Form.Select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                            </Form.Select>
                        </Col>
                    </Row>
                </Col>
            </Row>

            {error && <Alert variant="danger">{error}</Alert>}

            <Row xs={1} md={2} lg={3} className="g-4">
                {filteredResumes.map(resume => (
                    <Col key={resume.id}>
                        <Card className="resume-card h-100">
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <div>
                                        <Card.Title className="mb-1">
                                            <FontAwesomeIcon icon={faUser} className="me-2" />
                                            {resume.applicant}
                                        </Card.Title>
                                        <Card.Subtitle className="text-muted">
                                            <FontAwesomeIcon icon={faBriefcase} className="me-2" />
                                            {resume.job_post_name}
                                        </Card.Subtitle>
                                    </div>
                                    <Badge bg={getStatusBadgeVariant(resume.status)}>
                                        {resume.status}
                                    </Badge>
                                </div>
                                <Card.Text className="text-muted small mb-3">
                                    <FontAwesomeIcon icon={faCalendar} className="me-2" />
                                    Applied: {new Date(resume.created_at).toLocaleDateString()}
                                </Card.Text>
                                <Link 
                                    to={`/admin/hr/dashboard/resumes/${resume.id}`}
                                    className="mt-4 btn btn-outline-primary w-100"
                                >
                                    View Details
                                </Link>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
    );
};

export default Resumes;