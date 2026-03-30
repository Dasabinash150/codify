import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function NotFoundPage() {
  return (
    <>
      <Navbar />

      <div className="page-theme min-vh-100 d-flex align-items-center py-5">
        <div className="container">
          <div className="card card-theme border-0 shadow-sm rounded-4 mx-auto" style={{ maxWidth: "720px" }}>
            <div className="card-body p-4 p-md-5 text-center">
              <div className="display-1 fw-bold text-primary mb-2">404</div>
              <h1 className="h3 fw-bold mb-3">Page not found</h1>
              <p className="text-muted-custom mb-4">
                The page you are looking for does not exist or may have been moved.
              </p>

              <div className="d-flex flex-wrap justify-content-center gap-2">
                <Link to="/" className="btn btn-primary px-4">
                  Go Home
                </Link>
                <Link to="/problems" className="btn btn-outline-secondary px-4">
                  Browse Problems
                </Link>
                <Link to="/contests" className="btn btn-outline-primary px-4">
                  View Contests
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default NotFoundPage;