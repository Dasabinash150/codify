import { Container, Table, Card } from "react-bootstrap";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";

const leaderboard = [
  { rank: 1, name: "Alice", score: 500, time: "00:43:21" },
  { rank: 2, name: "Bob", score: 400, time: "00:50:10" },
  { rank: 3, name: "Charlie", score: 300, time: "00:55:40" },
];

function Leaderboard() {
  const { id } = useParams(); // ✅ hook now inside component

  return (
    <>
      <Navbar />
      <Container className="py-4">
        <Card className="shadow-sm">
          <Card.Body>
            <h2 className="mb-3">Leaderboard for Contest {id}</h2>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>User</th>
                  <th>Score</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((row) => (
                  <tr key={row.rank}>
                    <td>{row.rank}</td>
                    <td>{row.name}</td>
                    <td>{row.score}</td>
                    <td>{row.time}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </Container>
    </>
  );
}

export default Leaderboard;
