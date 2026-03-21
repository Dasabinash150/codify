import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import axios from "axios";
import Navbar from "../components/Navbar";


const API = import.meta.env.VITE_API_BASE_URL

function ContestList() {

    const [contests, setContests] = useState([]);

    useEffect(() => {

        axios.get(`${API}/api/contests/`)
            .then((res) => {
                setContests(res.data);
            })
            .catch((err) => {
                console.error("Error fetching contests:", err);
            });

    }, []);

    return (
        <>
            <Navbar />

            <Container className="py-5">
                <h2 className="text-center mb-4">Upcoming Contests</h2>

                <Row>

                    {contests.map((contest) => (

                        <Col md={4} key={contest.id} className="mb-4">

                            <Card className="h-100 shadow-sm">

                                <Card.Body>

                                    <Card.Title>{contest.name}</Card.Title>

                                    <Card.Text>
                                        {contest.description}
                                    </Card.Text>

                                    <p>
                                        <strong>Start:</strong> {contest.start_time}
                                        <br />
                                        <strong>End:</strong> {contest.end_time}
                                    </p>

                                    <Button
                                        variant="primary"
                                        href={`/contest/${contest.id}`}
                                    >
                                        Join Contest
                                    </Button>

                                </Card.Body>

                            </Card>

                        </Col>

                    ))}

                </Row>

            </Container>
        </>
    );
}

export default ContestList;