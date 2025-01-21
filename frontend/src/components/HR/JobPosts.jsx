import React, { useEffect, useState } from 'react';
import { Link, Routes, Route } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Spinner, Alert, Form, InputGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBriefcase, faUsers, faGraduationCap, faMapMarkerAlt, faFileContract, faSearch } from '@fortawesome/free-solid-svg-icons';
import JobPostDetail from './JobPostDetail';
import hrService from '../../services/hr.service';
import './styles/JobPost.css';

const JobPosts = () => {
    const [jobPosts, setJobPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');

    useEffect(() => {
        const fetchJobPosts = async () => {
            try {
                const response = await hrService.getJobPosts();
                setJobPosts(response.data);
            } catch (err) {
                setError('Failed to fetch job posts. Please try again.');
                console.error('Error fetching job posts:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchJobPosts();
    }, []);

    const filteredPosts = jobPosts.filter(post =>
        post.field.toLowerCase().includes(search.toLowerCase())
    ).filter(post => {
        if (filter === 'all') return true;
        if (filter === 'active') return post.is_active;
        if (filter === 'inactive') return !post.is_active;
        return true;
    }).sort((a, b) => {
        if (sortBy === 'newest') {
            return new Date(b.created_at) - new Date(a.created_at);
        }
        return new Date(a.created_at) - new Date(b.created_at);
    });

    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </Container>
        );
    }

    return (
        <Container fluid className="py-4">
            <Row className="mb-4">
                <Col>
                    <h2 className="mb-4">Job Posts</h2>
                    <Row className="g-3">
                        <Col md={4}>
                            <InputGroup>
                                <InputGroup.Text>
                                    <FontAwesomeIcon icon={faSearch} />
                                </InputGroup.Text>
                                <Form.Control
                                    placeholder="Search job posts..."
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
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
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

            {filteredPosts.length === 0 ? (
                <Alert variant="info">No job posts found.</Alert>
            ) : (
                <Row xs={1} md={2} lg={3} className="g-4">
                    {filteredPosts.map((post) => (
                        <Col key={post.id}>
                            <Card className="job-post-card h-100">
                                <Card.Body>
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <Card.Title className="mb-0">{post.field}</Card.Title>
                                        <Badge bg={post.is_active ? 'success' : 'secondary'}>
                                            {post.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>
                                    <Card.Text as="div">
                                        <div className="mb-2">
                                            <FontAwesomeIcon icon={faUsers} className="me-2" />
                                            <strong>Required:</strong> {post.required_employees} employees
                                        </div>
                                        <div className="mb-2">
                                            <FontAwesomeIcon icon={faGraduationCap} className="me-2" />
                                            <strong>Experience:</strong> {post.experience_level}
                                        </div>
                                        <div className="mb-2">
                                            <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                                            <strong>Workplace:</strong> {post.workplace}
                                        </div>
                                        <div className="mb-3">
                                            <FontAwesomeIcon icon={faFileContract} className="me-2" />
                                            <strong>Contract:</strong> {post.contract_type}
                                        </div>
                                    </Card.Text>
                                    <Link 
                                        to={`/admin/hr/dashboard/active-posts/${post.id}`}
                                        className="mt-4 btn btn-outline-primary w-100"
                                    >
                                        Edit Job Post
                                    </Link>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
            
            <Routes>
                <Route path=":id" element={<JobPostDetail />} />
            </Routes>
        </Container>
    );
};

export default JobPosts;