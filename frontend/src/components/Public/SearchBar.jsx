import React, { useState } from "react";
import { Form, InputGroup, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/jobs?search=${searchTerm}`);
  };

  return (
    <Form onSubmit={handleSearch} className="mt-4 mb-5">
      <InputGroup className="hero-search-bar">
        <Form.Control
          placeholder="Search for jobs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="py-3"
        />
        <Button variant="primary" type="submit" className="px-4">
          <FontAwesomeIcon icon={faSearch} className="me-2" />
          Search
        </Button>
      </InputGroup>
    </Form>
  );
};

export default SearchBar;
