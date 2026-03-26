import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getProblemById, getProblemTestCases } from "../services/problemApi";
import "bootstrap/dist/css/bootstrap.min.css";

function ProblemDetailPage() {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [testCases, setTestCases] = useState([]);
  const [activeCase, setActiveCase] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [problemRes, testCaseRes] = await Promise.all([
          getProblemById(id),
          getProblemTestCases(id),
        ]);

        setProblem(problemRes.data);
        setTestCases(Array.isArray(testCaseRes.data) ? testCaseRes.data : []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container py-5 text-center">
          <div className="spinner-border" />
        </div>
        <Footer />
      </>
    );
  }

  if (!problem) {
    return (
      <>
        <Navbar />
        <div className="container py-5">
          <div className="alert alert-danger">Problem not found.</div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container py-4">
        <div className="card shadow-sm border-0">
          <div className="card-body p-4">
            <Link to="/problems" className="text-decoration-none small">
              ← Back to Problems
            </Link>

            <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mt-2 mb-4">
              <div>
                <h2 className="fw-bold mb-1">{problem.title}</h2>
                <p className="text-muted mb-0">
                  Difficulty: {problem.difficulty} · Points: {problem.points ?? 100}
                </p>
              </div>

              <Link to={`/problems/${problem.id}/editor`} className="btn btn-primary">
                Solve Problem
              </Link>
            </div>

            <hr />

            <div className="mb-4">
              <h5 className="fw-semibold">Description</h5>
              <p>{problem.description}</p>
            </div>

            {problem.constraints && (
              <div className="mb-4">
                <h5 className="fw-semibold">Constraints</h5>
                <div>{problem.constraints}</div>
              </div>
            )}

            <div>
              <h5 className="fw-semibold">Sample Test Cases</h5>

              <div className="d-flex flex-wrap gap-2 mb-3">
                {testCases.map((item, index) => (
                  <button
                    key={item.id || index}
                    className={`btn btn-sm ${
                      activeCase === index ? "btn-primary" : "btn-outline-secondary"
                    }`}
                    onClick={() => setActiveCase(index)}
                  >
                    Case {index + 1}
                  </button>
                ))}
              </div>

              {testCases.length > 0 ? (
                <div className="border rounded p-3 bg-light">
                  <p className="mb-2"><strong>Input:</strong></p>
                  <pre>{testCases[activeCase]?.input}</pre>
                  <p className="mb-2"><strong>Expected Output:</strong></p>
                  <pre className="mb-0">{testCases[activeCase]?.expected_output}</pre>
                </div>
              ) : (
                <div className="alert alert-secondary">No test cases found.</div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default ProblemDetailPage;