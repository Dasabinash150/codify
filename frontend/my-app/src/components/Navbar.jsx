// // import { Link, useNavigate } from "react-router-dom";
// // import React, { useEffect, useRef, useState } from "react";
// // import API from "../api";

// // function Navbar() {
// //   const [user, setUser] = useState(null);
// //   const [openDropdown, setOpenDropdown] = useState(false);
// //   const navigate = useNavigate();
// //   const dropdownRef = useRef(null);

// //   useEffect(() => {
// //     const token = localStorage.getItem("access");
// //     const savedUsername = localStorage.getItem("username");

// //     if (token && savedUsername) {
// //       setUser({ username: savedUsername });
// //     } else {
// //       setUser(null);
// //     }

// //     if (token) {
// //       API
// //         .get("/api/user/profile/", {
// //           headers: {
// //             Authorization: `Bearer ${token}`,
// //           },
// //         })
// //         .then((res) => {
// //           setUser(res.data);
// //           if (res.data?.name) {
// //             localStorage.setItem("name", res.data.name);
// //           }
// //         })
// //         .catch((err) => {
// //           console.error("Profile fetch error:", err);

// //           if (err.response?.status === 401 || err.response?.status === 403) {
// //             localStorage.removeItem("access");
// //             localStorage.removeItem("refresh");
// //             localStorage.removeItem("username");
// //             setUser(null);
// //             navigate("/login", { replace: true });
// //           }
// //         });
// //     }
// //   }, [navigate]);

// //   useEffect(() => {
// //     const handleClickOutside = (event) => {
// //       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
// //         setOpenDropdown(false);
// //       }
// //     };

// //     document.addEventListener("mousedown", handleClickOutside);
// //     return () => {
// //       document.removeEventListener("mousedown", handleClickOutside);
// //     };
// //   }, []);

// //   const handleLogout = () => {
// //     localStorage.clear();
// //     setUser(null);
// //     setOpenDropdown(false);
// //     navigate("/login", { replace: true });

// //     setTimeout(() => {
// //       window.location.reload();
// //     }, 100);
// //   };

// //   const getInitial = () => {
// //     if (!user?.name) return "U";
// //     return user.name.charAt(0).toUpperCase();
// //   };

// //   return (
// //     <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
// //       <div className="container">
// //         <Link className="navbar-brand" to="/">
// //           JitCoder
// //         </Link>

// //         <button
// //           className="navbar-toggler"
// //           type="button"
// //           data-bs-toggle="collapse"
// //           data-bs-target="#navbarNav"
// //           aria-controls="navbarNav"
// //           aria-expanded="false"
// //           aria-label="Toggle navigation"
// //         >
// //           <span className="navbar-toggler-icon"></span>
// //         </button>

// //         <div className="collapse navbar-collapse" id="navbarNav">
// //           <ul className="navbar-nav ms-auto align-items-center gap-2">
// //             <li className="nav-item">
// //               <Link className="nav-link" to="/">
// //                 Home
// //               </Link>
// //             </li>

// //             <li className="nav-item">
// //               <Link className="nav-link" to="/contests">
// //                 Contests
// //               </Link>
// //             </li>

// //             <li className="nav-item">
// //               <Link className="nav-link" to="/contest/1/leaderboard">
// //                 Leaderboard
// //               </Link>
// //             </li>

// //             {user ? (
// //               <li className="nav-item position-relative" ref={dropdownRef}>
// //                 <button
// //                   type="button"
// //                   className="btn d-flex align-items-center gap-2 text-white border-0 bg-transparent"
// //                   onClick={() => setOpenDropdown(!openDropdown)}
// //                 >
// //                   <div
// //                     className="rounded-circle bg-primary d-flex justify-content-center align-items-center"
// //                     style={{
// //                       width: "38px",
// //                       height: "38px",
// //                       fontWeight: "bold",
// //                       fontSize: "16px",
// //                     }}
// //                   >
// //                     {getInitial()}
// //                   </div>
// //                   <span>{user.name}</span>
// //                 </button>

// //                 {openDropdown && (
// //                   <div
// //                     className="position-absolute end-0 mt-2 bg-white shadow rounded p-2"
// //                     style={{ minWidth: "200px", zIndex: 1000 }}
// //                   >
// //                     <div className="px-3 py-2 border-bottom">
// //                       <strong>{user.name}</strong>
// //                     </div>

// //                     <Link
// //                       to="/contests"
// //                       className="dropdown-item py-2"
// //                       onClick={() => setOpenDropdown(false)}
// //                     >
// //                       My Contests
// //                     </Link>

// //                     <hr className="my-2" />

// //                     <button
// //                       type="button"
// //                       className="dropdown-item text-danger py-2"
// //                       onClick={handleLogout}
// //                     >
// //                       Logout
// //                     </button>
// //                   </div>
// //                 )}
// //               </li>
// //             ) : (
// //               <>
// //                 <li className="nav-item">
// //                   <Link className="btn btn-primary" to="/login">
// //                     Login
// //                   </Link>
// //                 </li>
// //                 <li className="nav-item">
// //                   <Link className="btn btn-success" to="/register">
// //                     Register
// //                   </Link>
// //                 </li>
// //               </>
// //             )}
// //           </ul>
// //         </div>
// //       </div>
// //     </nav>
// //   );
// // }

// // export default Navbar;

// // // // src/components/Navbar.jsx
// // // import { Link } from "react-router-dom";
// // // import React, { useEffect, useState } from "react";
// // // import { useNavigate } from "react-router-dom";
// // // import axios from "axios";



// // // function Navbar() {
// // //     const [user, setUser] = useState(null);
// // //   const navigate = useNavigate();

// // //   useEffect(() => {
// // //     const token = localStorage.getItem("access_token");

// // //     if (token) {
// // //       axios
// // //         .get("http://127.0.0.1:8000/api/profile/", {
// // //           headers: {
// // //             Authorization: `Bearer ${token}`,
// // //           },
// // //         })
// // //         .then((res) => setUser(res.data))
// // //         .catch((err) => {
// // //           console.error(err);
// // //           localStorage.removeItem("access_token");
// // //           localStorage.removeItem("refresh_token");
// // //         });
// // //     }
// // //   }, []);

// // //   const handleLogout = () => {
// // //     localStorage.removeItem("access_token");
// // //     localStorage.removeItem("refresh_token");
// // //     setUser(null);
// // //     navigate("/login");
// // //   };

// // //   return (
// // //     <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
// // //       <div className="container">
// // //         <Link className="navbar-brand" to="/">CodeTest</Link>

// // //         <button 
// // //           className="navbar-toggler" 
// // //           type="button" 
// // //           data-bs-toggle="collapse" 
// // //           data-bs-target="#navbarNav" 
// // //           aria-controls="navbarNav" 
// // //           aria-expanded="false" 
// // //           aria-label="Toggle navigation"
// // //         >
// // //           <span className="navbar-toggler-icon"></span>
// // //         </button>

// // //         <div className="collapse navbar-collapse" id="navbarNav">
// // //           <ul className="navbar-nav ms-auto">
// // //             <li className="nav-item">
// // //               <Link className="nav-link" to="/">Home</Link>
// // //             </li>
// // //             <li className="nav-item">
// // //               <Link className="nav-link" to="/contests">Contests</Link>
// // //             </li>
// // //             <li className="nav-item">
// // //               <Link className="nav-link" to="/leaderboard">Leaderboard</Link>
// // //             </li>
// // //             <li className="nav-item y-5">
// // //               <Link className="btn btn-primary y-1" to="/login">Login</Link>
// // //             </li>
// // //             <li className="nav-item y-2">
// // //               <Link className="btn btn-success y-2" to="/register">Register</Link>
// // //             </li>
// // //           </ul>
// // //         </div>
// // //       </div>
// // //     </nav>
// // //   );
// // // }

// // // export default Navbar;






// import { Link, useNavigate } from "react-router-dom";
// import React, { useEffect, useRef, useState } from "react";
// import API from "../api";

// function Navbar() {
//   const [user, setUser] = useState(null);
//   const [openDropdown, setOpenDropdown] = useState(false);
//   const navigate = useNavigate();
//   const dropdownRef = useRef(null);

//   useEffect(() => {
//     const token = localStorage.getItem("access");
//     const savedUsername = localStorage.getItem("username");

//     if (token && savedUsername) {
//       setUser({ username: savedUsername });
//     } else {
//       setUser(null);
//     }

//     if (token) {
//       API.get("/api/user/profile/", {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       })
//         .then((res) => {
//           setUser(res.data);
//           if (res.data?.name) {
//             localStorage.setItem("name", res.data.name);
//           }
//         })
//         .catch((err) => {
//           console.error("Profile fetch error:", err);

//           if (err.response?.status === 401 || err.response?.status === 403) {
//             localStorage.removeItem("access");
//             localStorage.removeItem("refresh");
//             localStorage.removeItem("username");
//             setUser(null);
//             navigate("/login", { replace: true });
//           }
//         });
//     }
//   }, [navigate]);

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setOpenDropdown(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);

//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   const handleLogout = () => {
//     localStorage.clear();
//     setUser(null);
//     setOpenDropdown(false);
//     navigate("/login", { replace: true });

//     setTimeout(() => {
//       window.location.reload();
//     }, 100);
//   };

//   const getInitial = () => {
//     if (!user?.name) return "U";
//     return user.name.charAt(0).toUpperCase();
//   };

//   return (
//     <nav className="navbar navbar-expand-lg navbar-dark bg-dark border-bottom">
//       <div className="container">
//         <Link className="navbar-brand fw-bold" to="/">
//           JitCoder
//         </Link>

//         <button
//           className="navbar-toggler"
//           type="button"
//           data-bs-toggle="collapse"
//           data-bs-target="#navbarNav"
//           aria-controls="navbarNav"
//           aria-expanded="false"
//           aria-label="Toggle navigation"
//         >
//           <span className="navbar-toggler-icon"></span>
//         </button>

//         <div className="collapse navbar-collapse" id="navbarNav">
//           <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-2">
//             <li className="nav-item">
//               <Link className="nav-link" to="/">
//                 Home
//               </Link>
//             </li>

//             <li className="nav-item">
//               <Link className="nav-link" to="/contests">
//                 Contests
//               </Link>
//             </li>

//             <li className="nav-item">
//               <Link className="nav-link" to="/contest/1/leaderboard">
//                 Leaderboard
//               </Link>
//             </li>

//             {user ? (
//               <li className="nav-item position-relative" ref={dropdownRef}>
//                 <button
//                   type="button"
//                   className="btn text-white d-flex align-items-center gap-2 border-0 bg-transparent"
//                   onClick={() => setOpenDropdown(!openDropdown)}
//                 >
//                   <div
//                     className="rounded-circle bg-primary d-flex justify-content-center align-items-center text-white fw-bold"
//                     style={{ width: "38px", height: "38px" }}
//                   >
//                     {getInitial()}
//                   </div>
//                   <span>{user.name || user.username}</span>
//                 </button>

//                 {openDropdown && (
//                   <div
//                     className="position-absolute end-0 mt-2 bg-white shadow rounded py-2"
//                     style={{ minWidth: "180px", zIndex: 1000 }}
//                   >
//                     <div className="px-3 py-2 border-bottom fw-semibold">
//                       {user.name || user.username}
//                     </div>

//                     <Link
//                       to="/contests"
//                       className="dropdown-item"
//                       onClick={() => setOpenDropdown(false)}
//                     >
//                       My Contests
//                     </Link>
//                     <Link
//                       to="/dashboard"
//                       className="dropdown-item"
//                       onClick={() => setOpenDropdown(false)}
//                     >
//                       Dashboard
//                     </Link>

//                     <button
//                       type="button"
//                       className="dropdown-item text-danger"
//                       onClick={handleLogout}
//                     >
//                       Logout
//                     </button>
//                   </div>
//                 )}
//               </li>
//             ) : (
//               <>
//                 <li className="nav-item">
//                   <Link className="btn btn-outline-light me-2 mt-2 mt-lg-0" to="/login">
//                     Login
//                   </Link>
//                 </li>
//                 <li className="nav-item">
//                   <Link className="btn btn-primary mt-2 mt-lg-0" to="/register">
//                     Register
//                   </Link>
//                 </li>
//               </>
//             )}
//           </ul>
//         </div>
//       </div>
//     </nav>
//   );
// }

// export default Navbar;
import { Link } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import "../styles/navbar.css";

function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg border-bottom app-navbar sticky-top">
      <div className="container py-2">
        <Link
          className="navbar-brand fw-bold fs-4 d-flex align-items-center gap-2"
          to="/"
        >
          <span>{"</>"}</span>
          JitCoder
        </Link>

        <button
          className="navbar-toggler custom-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNavbar"
          aria-controls="mainNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className="collapse navbar-collapse" id="mainNavbar">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-lg-center gap-lg-2">
            <li className="nav-item">
              <Link className="nav-link fw-medium" to="/">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link fw-medium" to="/problems">
                Problems
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link fw-medium" to="/contests">
                Contests
              </Link>
            </li>
            <li className="nav-item mt-2 mt-lg-0">
              <Link className="btn btn-primary btn-sm px-3" to="/register">
                Sign Up
              </Link>
            </li>
            <li className="nav-item mt-2 mt-lg-0 ms-lg-2">
              <ThemeToggle />
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;