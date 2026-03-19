import React, { useState } from "react";
import axios from "axios";

function Register() {
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
    if (data.message) return data.message;
    if (data.error) return data.error;
    if (data.msg) return data.msg;

    if (data.errors) {
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
    try {
      setLoadingOtp(true);
      setError("");
      setMsg("");

      const email = formData.email.trim().toLowerCase();

      if (!email) {
        setError("Please enter email first");
        return;
      }

      const res = await axios.post("http://127.0.0.1:8000/api/user/send-otp/", {
        email,
      });

      setFormData((prev) => ({
        ...prev,
        email,
      }));

      setMsg(res.data.message || "OTP sent successfully");
      setOtpSent(true);
    } catch (err) {
      setError(getErrorMessage(err));
      console.log("Send OTP Error:", err.response?.data || err.message);
    } finally {
      setLoadingOtp(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoadingRegister(true);
      setError("");
      setMsg("");

      const payload = {
        ...formData,
        email: formData.email.trim().toLowerCase(),
        otp: formData.otp.trim(),
      };

      const res = await axios.post(
        "http://127.0.0.1:8000/api/user/registerotp/",
        payload
      );

      setMsg(res.data.msg || "Registration successful");
      console.log("Token:", res.data.token);

      localStorage.setItem("token", JSON.stringify(res.data.token));

      setFormData({
        name: "",
        email: "",
        password: "",
        password2: "",
        tc: true,
        otp: "",
      });
      setOtpSent(false);
    } catch (err) {
      setError(getErrorMessage(err));
      console.log("Register Error:", err.response?.data || err.message);
    } finally {
      setLoadingRegister(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h2 style={styles.heading}>Register with OTP</h2>
        <p style={styles.subheading}>Create your account securely</p>

        {msg && <p style={styles.success}>{msg}</p>}
        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Confirm Password</label>
            <input
              type="password"
              name="password2"
              placeholder="Confirm password"
              value={formData.password2}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.checkboxRow}>
            <input
              type="checkbox"
              name="tc"
              checked={formData.tc}
              onChange={handleChange}
              id="tc"
            />
            <label htmlFor="tc" style={styles.checkboxLabel}>
              I accept the terms and conditions
            </label>
          </div>

          <button
            type="button"
            onClick={sendOtp}
            disabled={loadingOtp || !formData.email}
            style={styles.otpButton}
          >
            {loadingOtp ? "Sending OTP..." : "Send OTP"}
          </button>

          {otpSent && (
            <>
              <div style={styles.inputGroup}>
                <label style={styles.label}>OTP</label>
                <input
                  type="text"
                  name="otp"
                  placeholder="Enter OTP"
                  value={formData.otp}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loadingRegister}
                style={styles.registerButton}
              >
                {loadingRegister ? "Registering..." : "Register"}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #e0ecff, #f4f7fb)",
    padding: "20px",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    background: "#fff",
    borderRadius: "16px",
    padding: "30px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
  },
  heading: {
    margin: 0,
    textAlign: "center",
    fontSize: "28px",
    fontWeight: "700",
    color: "#222",
  },
  subheading: {
    textAlign: "center",
    color: "#666",
    marginBottom: "24px",
  },
  inputGroup: {
    marginBottom: "16px",
  },
  label: {
    display: "block",
    marginBottom: "6px",
    fontWeight: "600",
    color: "#333",
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid #ccc",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
  },
  checkboxRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "16px",
  },
  checkboxLabel: {
    fontSize: "14px",
    color: "#444",
  },
  otpButton: {
    width: "100%",
    padding: "12px",
    border: "none",
    borderRadius: "10px",
    background: "#2563eb",
    color: "#fff",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    marginBottom: "14px",
  },
  registerButton: {
    width: "100%",
    padding: "12px",
    border: "none",
    borderRadius: "10px",
    background: "#16a34a",
    color: "#fff",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "8px",
  },
  success: {
    background: "#eafaf1",
    color: "#15803d",
    padding: "10px 12px",
    borderRadius: "8px",
    marginBottom: "16px",
    fontSize: "14px",
  },
  error: {
    background: "#fef2f2",
    color: "#dc2626",
    padding: "10px 12px",
    borderRadius: "8px",
    marginBottom: "16px",
    fontSize: "14px",
  },
};

export default Register;