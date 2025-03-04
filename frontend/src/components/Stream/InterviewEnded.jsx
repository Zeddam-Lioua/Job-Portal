import React from "react";
import { useSearchParams } from "react-router-dom";
import "./InterviewEnded.css";

const InterviewEnded = () => {
  const [searchParams] = useSearchParams();
  const isGuest = searchParams.get("guest") === "true";

  return (
    <div className="interview-ended-container">
      {isGuest ? (
        <>
          <h2>Thank You for Your Time!</h2>
          <p>The interview has concluded. We appreciate your participation.</p>
          <p>You may close this window now.</p>
        </>
      ) : (
        <>
          <h2>Interview Concluded</h2>
          <p>The interview session has ended.</p>
          <button
            className="btn btn-primary"
            onClick={() => (window.location.href = "/interviews")}
          >
            Return to Interview Platform
          </button>
        </>
      )}
    </div>
  );
};

export default InterviewEnded;
