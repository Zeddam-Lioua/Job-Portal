import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Spinner,
  Alert,
  Dropdown,
} from "react-bootstrap";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import hrService from "../../services/hr.service";
import "./styles/AnalyticsDashboard.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";

// Register the necessary components and scales with ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState("week");
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
        setError("Failed to load analytics stats");
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const ChartCard = ({ title, children }) => (
    <Card className="analytics-chart-card p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>{title}</h4>
        <Dropdown align="end">
          <Dropdown.Toggle variant="light" className="btn-sm">
            <FontAwesomeIcon icon={faEllipsisV} />
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={() => setTimeRange("week")}>
              Last Week
            </Dropdown.Item>
            <Dropdown.Item onClick={() => setTimeRange("month")}>
              Last Month
            </Dropdown.Item>
            <Dropdown.Item onClick={() => setTimeRange("all")}>
              All Time
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
      {children}
    </Card>
  );

  const formatDate = (date, timeRange) => {
    const d = new Date(date);
    switch (timeRange) {
      case "week":
        return `${d.toLocaleDateString("en-US", {
          weekday: "short",
        })} ${d.getDate()}`;
      case "month":
        return d.toLocaleDateString("en-US", { month: "short" });
      default: // year
        return d.getFullYear().toString();
    }
  };

  // Update the data formatting
  const applicationsPerDayData = {
    labels:
      stats.applicationsPerDay?.map((d) => formatDate(d.date, timeRange)) || [],
    datasets: [
      {
        label: "Applications",
        data: stats.applicationsPerDay?.map((d) => d.count) || [],
        borderColor: "rgba(75, 192, 192, 1)",
        tension: 0.1,
      },
    ],
  };

  const jobPostsPerDayData = {
    labels:
      stats.jobPostsPerDay?.map((d) => formatDate(d.date, timeRange)) || [],
    datasets: [
      {
        label: "Job Posts",
        data: stats.jobPostsPerDay?.map((d) => d.count) || [],
        borderColor: "rgba(153, 102, 255, 1)",
        tension: 0.1,
      },
    ],
  };

  const conversionRateData = {
    datasets: [
      {
        data: [
          stats.applicationConversionRate,
          100 - stats.applicationConversionRate,
        ],
        backgroundColor: [
          "rgba(153, 102, 255, 0.6)", // Main color for the rate
          "rgba(153, 102, 255, 0.1)", // Background color
        ],
        borderColor: ["rgba(153, 102, 255, 1)", "rgba(153, 102, 255, 0.1)"],
        borderWidth: 1,
        circumference: 180, // Make it a half circle
        rotation: -90, // Rotate to make the half circle face up
      },
    ],
  };

  const conversionRateOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    cutout: "70%", // How much of the center is cut out
  };

  if (loading) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "50vh" }}
      >
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
    labels: stats.applicationsPerJob.map((item) => item.field),
    datasets: [
      {
        label: "Applications per Job",
        data: stats.applicationsPerJob.map((item) => item.applications),
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const formatTimeToHire = (days) => {
    if (!days) return "0 days";
    return `${Number(days).toFixed(1)} days`;
  };

  const formatConversionRate = (rate) => {
    if (!rate) return "0%";
    return `${Number(rate).toFixed(2)}%`;
  };

  return (
    <Container fluid className="analytics-dashboard p-4">
      <Row className="mb-4">
        <Col>
          <h1 className="dashboard-title mb-5">Analytics Dashboard</h1>
          {/* First row of stat cards */}
          <Row className="mb-5">
            <Col md={4}>
              <Card className="analytics-stat-card">
                <Card.Body>
                  <h6 className="text-muted">Total Applications</h6>
                  <h3>{stats.totalApplications}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="analytics-stat-card">
                <Card.Body>
                  <h6 className="text-muted">Total Job Posts</h6>
                  <h3>{stats.totalJobPosts}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="analytics-stat-card">
                <Card.Body>
                  <h6 className="text-muted">Total Job Requests</h6>
                  <h3>{stats.totalRequests}</h3>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          {/* Second row of stat cards */}
          <Row className="mb-5">
            <Col md={4}>
              <Card className="analytics-stat-card">
                <Card.Body>
                  <h6 className="text-muted">Total Hires</h6>
                  <h3>{stats.totalHires}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="analytics-stat-card">
                <Card.Body>
                  <h6 className="text-muted">Average Time to Hire</h6>
                  <h3>{formatTimeToHire(stats.averageTimeToHire)}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="analytics-stat-card">
                <Card.Body>
                  <h6 className="text-muted">Application Conversion Rate</h6>
                  <h3>
                    {formatConversionRate(stats.applicationConversionRate)}
                  </h3>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          {/* Graphs row */}
          <Row className="mt-5">
            <Col md={6} className="mb-4">
              <Card className="analytics-chart-card p-4">
                <h4>Applications per Job</h4>
                <Bar data={applicationsPerJobData} />
              </Card>
            </Col>
            <Col md={6} className="mb-4">
              <ChartCard title="Application Conversion Rate">
                <div
                  className="d-flex justify-content-center align-items-center"
                  style={{ height: "300px" }}
                >
                  <div
                    className="position-relative"
                    style={{ width: "80%", maxWidth: "300px" }}
                  >
                    <Doughnut
                      data={conversionRateData}
                      options={conversionRateOptions}
                    />
                    <div
                      className="position-absolute top-50 start-50 translate-middle text-center"
                      style={{ width: "100%" }}
                    >
                      <h3 className="mb-0">
                        {stats.applicationConversionRate}%
                      </h3>
                      <small className="text-muted">Conversion Rate</small>
                    </div>
                  </div>
                </div>
              </ChartCard>
            </Col>
            <Col md={6} className="mb-4">
              <ChartCard title="Applications per Day">
                <Line data={applicationsPerDayData} />
              </ChartCard>
            </Col>
            <Col md={6} className="mb-4">
              <ChartCard title="Job Posts per Day">
                <Line data={jobPostsPerDayData} />
              </ChartCard>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
};
export default AnalyticsDashboard;
