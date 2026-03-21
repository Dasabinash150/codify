import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { Container, Table } from "react-bootstrap";
import Navbar from "../components/Navbar";
import API from "../api"; 

function LeaderboardPage() {
    const { id } = useParams();
    const [leaders, setLeaders] = useState([]);

    useEffect(() => {
        API
            .get(`/api/leaderboard/${id}/`)
            .then((res) => {
                console.log("Leaderboard API Response:", res.data);
                setLeaders(Array.isArray(res.data) ? res.data : []);
            })
            .catch((err) => console.error("Leaderboard error:", err));
    }, [id]);

    return (
        <>
            <Navbar />
            <Container className="mt-4">
                <h2>Leaderboard</h2>

                <Table striped bordered hover responsive>
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
                        {leaders.length > 0 ? (
                            leaders.map((item, index) => (
                                <tr key={item.id || index}>
                                    <td>{item.rank ?? index + 1}</td>
                                    <td>
                                        {item.user_name ||
                                            item.user_email ||
                                            item.user?.email ||
                                            item.user?.name ||
                                            item.user ||
                                            "N/A"}
                                    </td>
                                    <td>{item.score ?? 0}</td>
                                    <td>{item.solved ?? 0}</td>
                                    <td>
                                        {item.submitted_at && !isNaN(new Date(item.submitted_at).getTime())
                                            ? new Date(item.submitted_at).toLocaleString()
                                            : "N/A"}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="text-center">
                                    No leaderboard data found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </Container>
        </>
    );
}

export default LeaderboardPage;