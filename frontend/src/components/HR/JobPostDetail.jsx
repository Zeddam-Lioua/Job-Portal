import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import hrService from '../../services/hr.service';
import './styles/JobPost.css';

const JobPostDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [jobPost, setJobPost] = useState(null);
    const [formData, setFormData] = useState({
        field: '',
        required_employees: '',
        experience_level: '',
        education_level: '',
        workplace: '',
        contract_type: '',
        is_active: true,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchJobPost = async () => {
            try {
                const response = await hrService.getJobPost(id);
                setJobPost(response.data);
                setFormData({
                    field: response.data.field,
                    required_employees: response.data.required_employees,
                    experience_level: response.data.experience_level,
                    education_level: response.data.education_level,
                    workplace: response.data.workplace,
                    contract_type: response.data.contract_type,
                    is_active: response.data.is_active,
                });
            } catch (err) {
                setError('Failed to load job post details');
                console.error('Error fetching job post:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchJobPost();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await hrService.updateJobPost(id, formData);
            alert('Job post updated successfully!');
            navigate('/admin/hr/dashboard/job-posts');
        } catch (err) {
            setError('Failed to update job post. Please try again.');
            console.error('Error updating job post:', err);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this job post?')) {
            try {
                await hrService.deleteJobPost(id);
                alert('Job post deleted successfully!');
                navigate('/admin/hr/dashboard/job-posts');
            } catch (err) {
                setError('Failed to delete job post. Please try again.');
                console.error('Error deleting job post:', err);
            }
        }
    };

    if (error) {
        return (
            <Container className="py-4">
                <Alert variant="danger">{error}</Alert>
            </Container>
        );
    }

    if (!jobPost) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </Container>
        );
    }

    return (
        <Container className="py-4">
            <Card className="detail-card shadow-sm">
                <Card.Body>
                    <Card.Title className="mb-4">Job Post Details</Card.Title>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Field</Form.Label>
                            <Form.Control
                                type="text"
                                name="field"
                                value={formData.field}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Required Employees</Form.Label>
                            <Form.Control
                                type="number"
                                name="required_employees"
                                value={formData.required_employees}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Experience Level</Form.Label>
                            <Form.Select
                                name="experience_level"
                                value={formData.experience_level}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Experience Level</option>
                                <option value="indifferent">Indifferent</option>
                                <option value="Less than 1 year">Less than 1 year</option>
                                <option value="1-2 years">1-2 years</option>
                                <option value="2-3 years">2-3 years</option>
                                <option value="3-4 years">3-4 years</option>
                                <option value="4-5 years">4-5 years</option>
                                <option value="5-10 years">5-10 years</option>
                                <option value="More than 10 years">More than 10 years</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Education Level</Form.Label>
                            <Form.Select
                                name="education_level"
                                value={formData.education_level}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Education Level</option>
                                <option value="high_school">High School</option>
                                <option value="bachelors">Bachelor's Degree</option>
                                <option value="bachelors + 1">Bachelor's Degree + 1</option>
                                <option value="bachelors + 2">Bachelor's Degree + 2</option>
                                <option value="bachelors + 3">Bachelor's Degree + 3</option>
                                <option value="bachelors + 4">Bachelor's Degree + 4</option>
                                <option value="bachelors + 5">Bachelor's Degree + 5</option>
                                <option value="masters">Master's Degree</option>
                                <option value="phd">Ph.D.</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Workplace</Form.Label>
                            <Form.Select
                                name="workplace"
                                value={formData.workplace}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Workplace</option>
                                <option value="on_site">On Site</option>
                                <option value="partly_from_home">Partly from Home</option>
                                <option value="mostly_from_home">Mostly from Home</option>
                                <option value="100%_from_home">100% from Home</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Contract Type</Form.Label>
                            <Form.Select
                                name="contract_type"
                                value={formData.contract_type}
                                onChange={handleChange}
                                required
                            >
                                <option value="fixed_term">Fixed Term</option>
                                <option value="training">Training</option>
                                <option value="pre_employment">Pre-employment</option>
                                <option value="full_time">Full-time</option>
                                <option value="part_time">Part-time</option>
                                <option value="freelance">Freelance</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Status</Form.Label>
                            <Form.Select
                                name="is_active"
                                value={formData.is_active}
                                onChange={handleChange}
                                required
                            >
                                <option value={true}>Active</option>
                                <option value={false}>Inactive</option>
                            </Form.Select>
                        </Form.Group>
                        <div className="d-grid gap-2 mt-4">
                            <Button variant="primary" type="submit" className="thin-button">
                                Update Job Post
                            </Button>
                            <Button variant="danger" onClick={handleDelete} className="thin-button">
                                Delete Job Post
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default JobPostDetail;