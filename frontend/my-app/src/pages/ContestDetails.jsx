import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Container, Card, Button, ListGroup, Badge, Spinner } from "react-bootstrap";
import axios from "axios";

function ContestDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`http://127.0.0.1:8000/api/contests/${id}/`)
      .then((res) => {
        console.log("Contest API:", res.data);
        setContest(res.data);
      })
      .catch((err) => {
        console.error("Error fetching contest:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const getBadgeVariant = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "success";
      case "medium":
        return "warning";
      case "hard":
        return "danger";
      default:
        return "secondary";
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
        <h5 className="mt-3">Loading Contest...</h5>
      </Container>
    );
  }

  if (!contest) {
    return (
      <Container className="py-5 text-center">
        <h4>Contest not found</h4>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Card className="shadow-sm">
        <Card.Body>
          <h2>{contest.name}</h2>

          <p>
            <strong>Start:</strong> {contest.start_time} <br />
            <strong>End:</strong> {contest.end_time}
          </p>

          <h5>Problems</h5>

          {contest.contest_problems && contest.contest_problems.length > 0 ? (
            <ListGroup className="mb-3">
              {contest.contest_problems.map((item, index) => (
                <ListGroup.Item
                  key={item.id}
                  className="d-flex justify-content-between align-items-center"
                >
                  <span>
                    Q{index + 1}. {item.problem?.title}
                  </span>
                  <Badge bg={getBadgeVariant(item.problem?.difficulty)}>
                    {item.problem?.difficulty}
                  </Badge>
                </ListGroup.Item>
              ))}
            </ListGroup>
          ) : (
            <p>No problems found for this contest.</p>
          )}

          <Button
            variant="primary"
            onClick={() => navigate(`/contest/${id}/editor`)}
          >
            Start Contest
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default ContestDetails;