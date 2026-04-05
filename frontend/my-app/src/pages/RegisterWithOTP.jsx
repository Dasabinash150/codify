// src/pages/RegisterWithOTP.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import API from "../services/api";

function RegisterWithOTP() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password2: "",
    tc: true,
    otp: "",
  });

  const [otpSent, setOtpSent] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [loadingRegister, setLoadingRegister] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const getErrorMessage = (err) => {
    const data = err?.response?.data;

    if (!data) return "Something went wrong";

    if (typeof data === "string") return data;
    if (typeof data?.detail === "string") return data.detail;
    if (typeof data?.message === "string") return data.message;
    if (typeof data?.msg === "string") return data.msg;
    if (typeof data?.error === "string") return data.error;

    if (data?.errors) {
      const firstKey = Object.keys(data.errors)[0];
      const firstValue = data.errors[firstKey];

      if (Array.isArray(firstValue)) return firstValue[0];
      if (typeof firstValue === "string") return firstValue;
    }

    const firstKey = Object.keys(data)[0];
    const firstValue = data[firstKey];

    if (Array.isArray(firstValue)) return firstValue[0];
    if (typeof firstValue === "string") return firstValue;

    return "Request failed";
  };

  const sendOtp = async () => {
    const email = formData.email.trim().toLowerCase();

    if (!email) {
      setError("Please enter email first");
      return;
    }

    try {
      setLoadingOtp(true);
      setError("");
      setMsg("");

      const res = await API.post("/user/send-otp/", { email });

      setFormData((prev) => ({
        ...prev,
        email,
      }));

      setMsg(res?.data?.message || res?.data?.msg || "OTP sent successfully");
      setOtpSent(true);
    } catch (err) {
      console.error("Send OTP Error:", err?.response?.data || err.message);
      setError(getErrorMessage(err));
    } finally {
      setLoadingOtp(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.password2) {
      setError("Passwords do not match");
      return;
    }

    if (!formData.otp.trim()) {
      setError("Please enter OTP");
      return;
    }

    try {
      setLoadingRegister(true);
      setError("");
      setMsg("");

      const payload = {
        ...formData,
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        otp: formData.otp.trim(),
      };

      const res = await API.post("/user/registerotp/", payload);

      setMsg(res?.data?.msg || res?.data?.message || "Registration successful");

      const access = res?.data?.token?.access || res?.data?.access;
      const refresh = res?.data?.token?.refresh || res?.data?.refresh;

      if (access) localStorage.setItem("access", access);
      if (refresh) localStorage.setItem("refresh", refresh);

      localStorage.setItem("username", payload.name || payload.email);

      setFormData({
        name: "",
        email: "",
        password: "",
        password2: "",
        tc: true,
        otp: "",
      });

      setOtpSent(false);

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (err) {
      console.error("Register Error:", err?.response?.data || err.message);
      setError(getErrorMessage(err));
    } finally {
      setLoadingRegister(false);
    }
  };

  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="row w-100 justify-content-center">
        <div className="col-12 col-sm-10 col-md-8 col-lg-5 col-xl-4">
          <div className="card shadow-lg border-0 rounded-4">
            <div className="card-body p-4 p-md-5">
              <div className="text-center mb-4">
                <h2 className="fw-bold mb-2">Register with OTP</h2>
                <p className="text-muted mb-0">Create your account securely</p>
              </div>

              {msg && (
                <div className="alert alert-success" role="alert">
                  {msg}
                </div>
              )}

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Name</label>
                  <input
                    type="text"
                    name="name"
                    className="form-control form-control-lg"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Email</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control form-control-lg"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Password</label>
                  <input
                    type="password"
                    name="password"
                    className="form-control form-control-lg"
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Confirm Password</label>
                  <input
                    type="password"
                    name="password2"
                    className="form-control form-control-lg"
                    placeholder="Confirm password"
                    value={formData.password2}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-check mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    name="tc"
                    id="tc"
                    checked={formData.tc}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="tc">
                    I accept the terms and conditions
                  </label>
                </div>

                <div className="d-grid mb-3">
                  <button
                    type="button"
                    className="btn btn-primary btn-lg"
                    onClick={sendOtp}
                    disabled={loadingOtp || !formData.email.trim()}
                  >
                    {loadingOtp ? "Sending OTP..." : "Send OTP"}
                  </button>
                </div>

                {otpSent && (
                  <>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">OTP</label>
                      <input
                        type="text"
                        name="otp"
                        className="form-control form-control-lg"
                        placeholder="Enter OTP"
                        value={formData.otp}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="d-grid">
                      <button
                        type="submit"
                        className="btn btn-success btn-lg"
                        disabled={loadingRegister}
                      >
                        {loadingRegister ? "Registering..." : "Register"}
                      </button>
                    </div>
                  </>
                )}
              </form>

              <div className="text-center mt-4">
                <small className="text-muted">
                  Already have an account? <Link to="/login">Login</Link>
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterWithOTP;