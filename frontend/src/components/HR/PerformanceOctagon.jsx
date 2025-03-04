import React, { useState, useEffect } from "react";
import { Radar } from "react-chartjs-2";
import { Form, Row, Col, Dropdown, Button } from "react-bootstrap";
import "./styles/PerformanceOctagon.css";

const PerformanceOctagon = ({
  applicantId,
  initialData,
  onSave,
  readOnly = false,
  hideLabels = false,
  hideScores = false,
}) => {
  const [evaluation, setEvaluation] = useState(
    initialData || {
      technical_skills: 0,
      communication: 0,
      problem_solving: 0,
      teamwork: 0,
      leadership: 0,
      adaptability: 0,
      work_ethic: 0,
      creativity: 0,
    }
  );

  const skillsOrder = [
    "technical_skills",
    "communication",
    "problem_solving",
    "teamwork",
    "leadership",
    "adaptability",
    "work_ethic",
    "creativity",
  ];

  useEffect(() => {
    if (initialData) {
      setEvaluation(initialData);
    }
  }, [initialData]);

  const handleChange = (field, value) => {
    setEvaluation((prev) => ({
      ...prev,
      [field]: parseInt(value),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSave) {
      onSave(evaluation);
    }
  };

  const data = {
    labels: skillsOrder.map((key, index) =>
      hideLabels
        ? `${index + 1}`
        : `${index + 1}. ${key
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")}`
    ),
    datasets: [
      {
        data: skillsOrder.map((key) => evaluation[key]),
        fill: true,
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgb(75, 192, 192)",
        pointBackgroundColor: "rgb(75, 192, 192)",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgb(75, 192, 192)",
      },
    ],
  };

  const options = {
    scales: {
      r: {
        min: 0,
        max: 10,
        stepSize: 2, // Reduced number of circles
        ticks: {
          display: !hideScores,
          stepSize: 2,
        },
        pointLabels: {
          display: true,
          font: {
            size: 14,
            weight: "bold",
          },
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
    maintainAspectRatio: false,
  };

  if (readOnly) {
    return (
      <Row className="align-items-center">
        <Col>
          <div className="radar-container" style={{ height: "300px" }}>
            <Radar data={data} options={options} />
          </div>
        </Col>
      </Row>
    );
  }

  return (
    <div className="p-4">
      <Row>
        <Col md={6}>
          <div className="radar-container" style={{ height: "300px" }}>
            <Radar data={data} options={options} />
          </div>
        </Col>
        <Col md={6}>
          <Form onSubmit={handleSubmit}>
            <div className="evaluation-sliders">
              {Object.keys(evaluation).map((field) => (
                <div key={field} className="slider-group">
                  <label>
                    {field
                      .split("_")
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1)
                      )
                      .join(" ")}
                    <span className="score-display">
                      {evaluation[field]}/10
                    </span>
                  </label>
                  <input
                    type="range"
                    className="custom-range"
                    min="0"
                    max="10"
                    value={evaluation[field]}
                    onChange={(e) => handleChange(field, e.target.value)}
                  />
                </div>
              ))}
            </div>
            <Button type="submit" variant="primary" className="mt-3">
              Save Changes
            </Button>
          </Form>
        </Col>
      </Row>
    </div>
  );
};

export default PerformanceOctagon;
