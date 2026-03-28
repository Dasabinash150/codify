// src/pages/Register.jsx

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await fetch("/api/user/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          password2: confirmPassword,
          tc: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.msg || "Registration failed");
      }

      // store tokens
      localStorage.setItem("access", data.token.access);
      localStorage.setItem("refresh", data.token.refresh);

      alert("Registration successful");

      navigate("/login");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <Navbar />

      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6">

            <div className="card shadow-lg border-0 rounded-4">
              <div className="card-body p-4">

                <h2 className="text-center mb-4">Register</h2>

                {error && (
                  <div className="alert alert-danger">{error}</div>
                )}

                <form onSubmit={handleRegister}>

                  <div className="mb-3">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      className="form-control"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Confirm Password</label>
                    <input
                      type="password"
                      className="form-control"
                      value={confirmPassword}
                      onChange={(e) =>
                        setConfirmPassword(e.target.value)
                      }
                      required
                    />
                  </div>

                  <button className="btn btn-success w-100">
                    Register
                  </button>

                </form>

                <p className="text-center mt-3">
                  Already have an account?
                  <Link to="/login"> Login here</Link>
                </p>

              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

export default Register;