// src/pages/Homepage.jsx
import { useEffect } from "react";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import API from "../api";



function Homepage() {
  useEffect(() => {
    API.get("/api/users/")
      .then((res) => console.log(res.data))
      .catch((err) => console.error(err));
  }, []);
  return (
    <>
      <Navbar />
      <header className="bg-light text-dark py-5">
        <div className="container text-center">
          <h1 className="display-4 fw-bold">Welcome to CodeTest Platform</h1>
          <p className="lead">
            Practice coding, compete in contests, and climb the leaderboard.
          </p>
          <div className="mt-4">
            <Link to="/contests" className="btn btn-primary btn-lg me-3">
              View Contests
            </Link>
            <Link to="/login" className="btn btn-outline-dark btn-lg">
              Login
            </Link>
          </div>
        </div>
      </header>

      <section className="py-5">
        <div className="container text-center">
          <h2 className="mb-4">Why Choose Us?</h2>
          <div className="row">
            <div className="col-md-4">
              <h5>💻 Coding Practice</h5>
              <p>Sharpen your coding skills with real-world problems.</p>
            </div>
            <div className="col-md-4">
              <h5>🏆 Competitions</h5>
              <p>Participate in contests and test yourself against others.</p>
            </div>
            <div className="col-md-4">
              <h5>📊 Leaderboard</h5>
              <p>Track your progress and rise in the global rankings.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Homepage;
