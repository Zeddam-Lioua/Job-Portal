import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBriefcase,
  faBuilding,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import SearchBar from "./SearchBar";
import JobCategories from "./JobCategories";
import FeaturedJobs from "./FeaturedJobs";
import CareerTipsGrid from "./CareerTipsGrid";
import NewsletterSignup from "./NewsletterSignup";
import StatisticCard from "./StatisticCard";
import "./styles/Home.css";

const Home = () => {
  return (
    <>
      {/* Hero Section */}
      <section className="hero-section text-center py-5">
        <Container>
          <h1>Find Your Dream Job Today</h1>
          <SearchBar />
          <JobCategories />
        </Container>
      </section>

      {/* Featured Jobs */}
      <section className="featured-jobs py-5">
        <Container>
          <h2>Featured Job Opportunities</h2>
          <FeaturedJobs />
        </Container>
      </section>

      {/* Statistics */}
      <section className="statistics bg-light py-5">
        <Container>
          <Row>
            <StatisticCard
              number="1000+"
              text="Jobs Posted"
              icon={faBriefcase}
            />
            <StatisticCard number="500+" text="Companies" icon={faBuilding} />
            <StatisticCard
              number="10000+"
              text="Success Stories"
              icon={faStar}
            />
          </Row>
        </Container>
      </section>

      {/* Career Tips */}
      <section className="career-tips py-5">
        <Container>
          <h2>Career Tips & Insights</h2>
          <CareerTipsGrid />
        </Container>
      </section>

      {/* Newsletter */}
      <section className="newsletter bg-primary text-white py-5">
        <Container>
          <NewsletterSignup />
        </Container>
      </section>
    </>
  );
};

export default Home;
