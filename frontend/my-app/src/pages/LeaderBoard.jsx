import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { Container, Table } from "react-bootstrap";

function LeaderboardPage() {
    const { id } = useParams();
    const [leaders, setLeaders] = useState([]);

    useEffect(() => {
        axios.get(`http://127.0.0.1:8000/api/leaderboard/${id}/`)
            .then((res) => setLeaders(res.data))
            .catch((err) => console.error(err));
    }, [id]);

    return (
        <Container className="mt-4">
            <h2>Leaderboard</h2>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>User</th>
                        <th>Score</th>
                        <th>Solved</th>
                        <th>Submitted At</th>
                    </tr>
                </thead>
                <tbody>
                    {leaders.map((item, index) => (
                        <tr key={index}>
                            <td>{item.rank}</td>
                            <td>{item.user}</td>
                            <td>{item.score}</td>
                            <td>{item.solved}</td>
                            <td>{item.submitted_at}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Container>
    );
}

export default LeaderboardPage;