import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import GoogleLoginButton from "../components/GoogleLoginButton";
import API from "../api";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await API.post(
        "/api/user/login/",
        formData
      );

      console.log("Login response:", res.data);

      // const access = res.data.access || res.data.token?.access;
      // const refresh = res.data.refresh || res.data.token?.refresh;
      // const username = res.data.user?.username || "";
      const access = res.data.token?.access;
      const refresh = res.data.token?.refresh;
      localStorage.setItem("username", formData.email);

      if (!access || !refresh) {
        setError("Token not found in response");
        return;
      }

      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);
      localStorage.setItem("name", name);

      setSuccess("Login successful! Redirecting...");
      navigate("/");
      window.location.reload();
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      setError(
        err.response?.data?.errors ||
        err.response?.data?.detail ||
        "Invalid credentials"
      );
    }
  };

  return (
    <>
      <Navbar />
      <div className="container logIn-box mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card shadow">
              <div className="card-body p-4">
                <h2 className="text-center mb-4">Login</h2>

                {error && <div className="alert alert-danger">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Email address</label>
                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      name="password"
                      className="form-control"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <button type="submit" className="btn btn-primary w-100">
                    Login
                  </button>
                </form>
                <div className="text-center my-3">
                  <strong>OR</strong>
                </div>

                <div className="text-center">
                  <GoogleLoginButton />
                </div>

                <p className="text-center mt-3">
                  Don’t have an account?{" "}
                  <Link to="/register">Register here</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;





// import React, { useState } from "react";
// import axios from "axios";
// import { Link } from "react-router-dom";
// import Navbar from "../components/Navbar";

// const Login = () => {
//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//   });

//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");

//   // Handle input change
//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   // Handle form submission
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setSuccess("");

//     try {
//       const res = await axios.post(
//         "http://127.0.0.1:8000/api/user/login/",
//         formData
//       );
//       console.log(formData);

//       // Save token to localStorage
//       localStorage.setItem("access", res.data.token.access);
//       localStorage.setItem("refresh", res.data.token.refresh);
//       localStorage.setItem("username", res.data.user.username); // save username

//       setSuccess("Login successful! Redirecting...");
//       // Redirect to dashboard
//       window.location.href = "/contests";
//     } catch (err) {
//       setError(err.response?.data?.errors || "Invalid credentials");
//     }
//   };

//   return (
//     <>
//       <Navbar />
//       <div className="container logIn-box mt-5">
//         <div className="row justify-content-center">
//           <div className="col-md-6">
//             <div className="card shadow">
//               <div className="card-body p-4">
//                 <h2 className="text-center mb-4">Login</h2>
//                 {error && <div className="alert alert-danger">{error}</div>}
//                 {success && <div className="alert alert-success">{success}</div>}

//                 <form onSubmit={handleSubmit}>
//                   <div className="mb-3">
//                     <label className="form-label">Email address</label>
//                     <input
//                       type="email"
//                       name="email"
//                       className="form-control"
//                       value={formData.email}
//                       onChange={handleChange}
//                       required
//                     />
//                   </div>

//                   <div className="mb-3">
//                     <label className="form-label">Password</label>
//                     <input
//                       type="password"
//                       name="password"
//                       className="form-control"
//                       value={formData.password}
//                       onChange={handleChange}
//                       required
//                     />
//                   </div>

//                   <button type="submit" className="btn btn-primary w-100">
//                     Login
//                   </button>
//                 </form>

//                 <p className="text-center mt-3">
//                   Don’t have an account? <Link to="/register">Register here</Link>
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default Login;
