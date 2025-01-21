import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import hrService from '../../services/hr.service';
import './styles/AnalyticsDashboard.css';

// Register the necessary components and scales with ChartJS
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

const AnalyticsDashboard = () => {
    const [stats, setStats] = useState({
        totalApplications: 0,
        totalJobPosts: 0,
        totalHires: 0,
        applicationsPerJob: [],
        averageTimeToHire: 0,
        applicationConversionRate: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await hrService.getAnalyticsStats();
                setStats(response.data);
            } catch (err) {
                setError('Failed to load analytics stats');
                console.error('Error fetching stats:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="py-4">
                <Alert variant="danger">{error}</Alert>
            </Container>
        );
    }

    const applicationsPerJobData = {
        labels: stats.applicationsPerJob.map(item => item.field),
        datasets: [
            {
                label: 'Applications per Job',
                data: stats.applicationsPerJob.map(item => item.applications),
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
        ],
    };

    const conversionRateData = {
        labels: ['Conversion Rate'],
        datasets: [
            {
                label: 'Application Conversion Rate (%)',
                data: [stats.applicationConversionRate],
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1,
            },
        ],
    };

    return (
        <Container fluid className="analytics-dashboard p-4">
            <Row className="mb-4">
                <Col>
                    <h1 className="dashboard-title mb-4">Analytics Dashboard</h1>
                    <Row>
                        <Col md={4}>
                            <Card className="analytics-stat-card mb-3">
                                <Card.Body>
                                    <h6 className="text-muted">Total Applications</h6>
                                    <h3>{stats.totalApplications}</h3>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4}>
                            <Card className="analytics-stat-card mb-3">
                                <Card.Body>
                                    <h6 className="text-muted">Total Job Posts</h6>
                                    <h3>{stats.totalJobPosts}</h3>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4}>
                            <Card className="analytics-stat-card mb-3">
                                <Card.Body>
                                    <h6 className="text-muted">Total Hires</h6>
                                    <h3>{stats.totalHires}</h3>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={4}>
                            <Card className="analytics-stat-card mb-3">
                                <Card.Body>
                                    <h6 className="text-muted">Average Time to Hire</h6>
                                    <h3>{stats.averageTimeToHire} days</h3>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4}>
                            <Card className="analytics-stat-card mb-3">
                                <Card.Body>
                                    <h6 className="text-muted">Application Conversion Rate</h6>
                                    <h3>{stats.applicationConversionRate}%</h3>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6}>
                            <h3>Applications per Job</h3>
                            <Bar data={applicationsPerJobData} />
                        </Col>
                        <Col md={6}>
                            <h3>Application Conversion Rate</h3>
                            <Line data={conversionRateData} />
                        </Col>
                    </Row>
                </Col>
            </Row>
        </Container>
    );
};

export default AnalyticsDashboard;