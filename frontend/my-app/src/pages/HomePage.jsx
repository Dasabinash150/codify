// // // src/pages/Homepage.jsx
// // import { useEffect } from "react";
// import Navbar from "../components/Navbar";
// import Footer from "../components/Footer";
// // import { Link } from "react-router-dom";
// // import API from "../api";



// // function Homepage() {
// //   useEffect(() => {
// //     API.get("/api/users/")
// //       .then((res) => console.log(res.data))
// //       .catch((err) => console.error(err));
// //   }, []);
// //   return (
// //     <>
// //       <Navbar />
// //       <header className="bg-light text-dark py-5">
// //         <div className="container text-center">
// //           <h1 className="display-4 fw-bold">Welcome to CodeTest Platform</h1>
// //           <p className="lead">
// //             Practice coding, compete in contests, and climb the leaderboard.
// //           </p>
// //           <div className="mt-4">
// //             <Link to="/contests" className="btn btn-primary btn-lg me-3">
// //               View Contests
// //             </Link>
// //             <Link to="/login" className="btn btn-outline-dark btn-lg">
// //               Login
// //             </Link>
// //           </div>
// //         </div>
// //       </header>

// //       <section className="py-5">
// //         <div className="container text-center">
// //           <h2 className="mb-4">Why Choose Us?</h2>
// //           <div className="row">
// //             <div className="col-md-4">
// //               <h5>💻 Coding Practice</h5>
// //               <p>Sharpen your coding skills with real-world problems.</p>
// //             </div>
// //             <div className="col-md-4">
// //               <h5>🏆 Competitions</h5>
// //               <p>Participate in contests and test yourself against others.</p>
// //             </div>
// //             <div className="col-md-4">
// //               <h5>📊 Leaderboard</h5>
// //               <p>Track your progress and rise in the global rankings.</p>
// //             </div>
// //           </div>
// //         </div>
// //       </section>
// //     </>
// //   );
// // }

// // export default Homepage;



// import React from "react";
// import { Link } from "react-router-dom";
// import {
//   FaCode,
//   FaTrophy,
//   FaChartLine,
//   FaUserPlus,
//   FaLaptopCode,
//   FaMedal,
// } from "react-icons/fa";
// import "bootstrap/dist/css/bootstrap.min.css";
// import "../styles/home.css";

// function HomePage() {
//   return (
//     <div className="homepage">
//       {/* Navbar */}
//       {/* <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
//         <div className="container">
//           <Link className="navbar-brand fw-bold fs-3 text-dark" to="/">
//             JitCoder
//           </Link>

//           <button
//             className="navbar-toggler"
//             type="button"
//             data-bs-toggle="collapse"
//             data-bs-target="#mainNavbar"
//           >
//             <span className="navbar-toggler-icon"></span>
//           </button>

//           <div className="collapse navbar-collapse" id="mainNavbar">
//             <ul className="navbar-nav ms-auto align-items-lg-center">
//               <li className="nav-item">
//                 <Link className="nav-link fw-semibold" to="/">
//                   Home
//                 </Link>
//               </li>
//               <li className="nav-item">
//                 <Link className="nav-link fw-semibold" to="/problems">
//                   Problems
//                 </Link>
//               </li>
//               <li className="nav-item">
//                 <Link className="nav-link fw-semibold" to="/contests">
//                   Contests
//                 </Link>
//               </li>
//               <li className="nav-item">
//                 <Link className="nav-link fw-semibold" to="/leaderboard">
//                   Leaderboard
//                 </Link>
//               </li>
//               <li className="nav-item ms-lg-3 mt-2 mt-lg-0">
//                 <Link className="btn btn-dark px-4" to="/login">
//                   Login
//                 </Link>
//               </li>
//             </ul>
//           </div>
//         </div>
//       </nav> */}
//       <Navbar />
//       {/* Hero */}
//       <section className="hero-section d-flex align-items-center">
//         <div className="container">
//           <div className="row align-items-center g-4">
//             <div className="col-lg-6">
//               <span className="hero-badge">Practice • Compete • Improve</span>
//               <h1 className="hero-title mt-3">
//                 Practice Coding. <br />
//                 Compete. Improve.
//               </h1>
//               <p className="hero-text mt-3">
//                 Solve coding problems, join contests, improve your logic, and
//                 track your performance in one professional coding platform.
//               </p>

//               <div className="d-flex flex-wrap gap-3 mt-4">
//                 <Link to="/problems" className="btn btn-primary btn-lg px-4">
//                   Start Coding
//                 </Link>

//                 <Link to="/contests" className="btn btn-outline-primary btn-lg px-4">
//                   View Contests
//                 </Link>
//               </div>
//             </div>

//             <div className="col-lg-6">
//               <div className="hero-card shadow-lg">
//                 <div className="mini-box">
//                   <h6>Problems Solved</h6>
//                   <h3>1200+</h3>
//                 </div>
//                 <div className="mini-box">
//                   <h6>Live Contests</h6>
//                   <h3>50+</h3>
//                 </div>
//                 <div className="mini-box">
//                   <h6>Active Users</h6>
//                   <h3>10K+</h3>
//                 </div>
//                 <div className="mini-box">
//                   <h6>Track Progress</h6>
//                   <h3>100%</h3>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Features */}
//       <section className="features-section py-5">
//         <div className="container">
//           <div className="text-center mb-5">
//             <span className="section-badge">Why Choose JitCoder</span>
//             <h2 className="section-title mt-3">Features Built for Growth</h2>
//             <p className="section-subtitle">
//               Everything you need to practice smarter, compete better, and improve consistently.
//             </p>
//           </div>

//           <div className="row g-4">
//             <div className="col-md-4">
//               <div className="feature-card h-100 text-center">
//                 <div className="icon-box mx-auto">
//                   <FaCode />
//                 </div>
//                 <h4 className="mt-4">Practice Problems</h4>
//                 <p>
//                   Solve beginner to advanced coding challenges with clear statements,
//                   examples, and test cases.
//                 </p>
//               </div>
//             </div>

//             <div className="col-md-4">
//               <div className="feature-card h-100 text-center">
//                 <div className="icon-box mx-auto">
//                   <FaTrophy />
//                 </div>
//                 <h4 className="mt-4">Live Contests</h4>
//                 <p>
//                   Join real-time contests, compete with others, and sharpen your speed,
//                   accuracy, and confidence.
//                 </p>
//               </div>
//             </div>

//             <div className="col-md-4">
//               <div className="feature-card h-100 text-center">
//                 <div className="icon-box mx-auto">
//                   <FaChartLine />
//                 </div>
//                 <h4 className="mt-4">Track Progress</h4>
//                 <p>
//                   Monitor solved problems, submissions, rankings, and performance trends
//                   in one place.
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* How It Works */}
//       <section className="works-section py-5">
//         <div className="container">
//           <div className="text-center mb-5">
//             <span className="section-badge">Simple Process</span>
//             <h2 className="section-title mt-3">How It Works</h2>
//             <p className="section-subtitle">
//               Start your coding journey in three simple steps.
//             </p>
//           </div>

//           <div className="row g-4">
//             <div className="col-md-4">
//               <div className="step-card text-center h-100">
//                 <div className="step-number">01</div>
//                 <div className="step-icon mx-auto">
//                   <FaUserPlus />
//                 </div>
//                 <h5 className="mt-4">Create Account</h5>
//                 <p>
//                   Sign up and create your profile to begin practicing and tracking your coding journey.
//                 </p>
//               </div>
//             </div>

//             <div className="col-md-4">
//               <div className="step-card text-center h-100">
//                 <div className="step-number">02</div>
//                 <div className="step-icon mx-auto">
//                   <FaLaptopCode />
//                 </div>
//                 <h5 className="mt-4">Solve Problems</h5>
//                 <p>
//                   Practice daily, write code in the editor, test solutions, and build strong logic.
//                 </p>
//               </div>
//             </div>

//             <div className="col-md-4">
//               <div className="step-card text-center h-100">
//                 <div className="step-number">03</div>
//                 <div className="step-icon mx-auto">
//                   <FaMedal />
//                 </div>
//                 <h5 className="mt-4">Compete & Rank</h5>
//                 <p>
//                   Participate in contests, improve your score, and grow your position on the leaderboard.
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* CTA */}
//       <section className="cta-section py-5">
//         <div className="container">
//           <div className="cta-box text-center">
//             <span className="section-badge">Get Started Today</span>
//             <h2 className="fw-bold mt-3 mb-3">Ready to start your coding journey?</h2>
//             <p className="mb-4">
//               Practice smarter, compete better, and grow faster with JitCoder.
//             </p>
//             <Link to="/signup" className="btn btn-primary btn-lg px-5">
//               Get Started
//             </Link>
//           </div>
//         </div>
//       </section>

//       {/* Footer */}
//       <Footer />
//     </div>
//   );
// }

// export default HomePage;




import { Link } from "react-router-dom";
import {
  FaCode,
  FaTrophy,
  FaChartLine,
  FaUserPlus,
  FaLaptopCode,
  FaMedal,
} from "react-icons/fa";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function HomePage() {
  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="py-5 py-lg-6">
        <div className="container py-lg-5">
          <div className="row align-items-center g-4">
            <div className="col-lg-6">
              <span className="badge rounded-pill app-badge px-3 py-2">
                Practice • Compete • Improve
              </span>

              <h1 className="display-4 fw-bold mt-3 lh-sm">
                Practice Coding.
                <br />
                Compete. Improve.
              </h1>

              <p className="mt-3 fs-5 text-secondary">
                Solve coding problems, join contests, improve your logic, and
                track your performance in one professional coding platform.
              </p>

              <div className="d-flex flex-wrap gap-3 mt-4">
                <Link to="/problems" className="btn btn-primary btn-lg px-4">
                  Start Coding
                </Link>
                <Link
                  to="/contests"
                  className="btn btn-outline-primary btn-lg px-4"
                >
                  View Contests
                </Link>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="card shadow-sm border-0 app-card">
                <div className="card-body p-4">
                  <div className="row g-3 text-center">
                    <div className="col-6">
                      <div className="card h-100 border-0 app-soft-card">
                        <div className="card-body">
                          <h6 className="text-secondary mb-2">
                            Problems Solved
                          </h6>
                          <h3 className="fw-bold mb-0">1200+</h3>
                        </div>
                      </div>
                    </div>

                    <div className="col-6">
                      <div className="card h-100 border-0 app-soft-card">
                        <div className="card-body">
                          <h6 className="text-secondary mb-2">
                            Live Contests
                          </h6>
                          <h3 className="fw-bold mb-0">50+</h3>
                        </div>
                      </div>
                    </div>

                    <div className="col-6">
                      <div className="card h-100 border-0 app-soft-card">
                        <div className="card-body">
                          <h6 className="text-secondary mb-2">
                            Active Users
                          </h6>
                          <h3 className="fw-bold mb-0">10K+</h3>
                        </div>
                      </div>
                    </div>

                    <div className="col-6">
                      <div className="card h-100 border-0 app-soft-card">
                        <div className="card-body">
                          <h6 className="text-secondary mb-2">
                            Track Progress
                          </h6>
                          <h3 className="fw-bold mb-0">100%</h3>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-5 app-section">
        <div className="container py-lg-4">
          <div className="text-center mb-5">
            <span className="badge rounded-pill app-badge px-3 py-2">
              Why Choose JitCoder
            </span>
            <h2 className="fw-bold mt-3">Features</h2>
            <p className="text-secondary mb-0">
              Everything you need to become better at coding.
            </p>
          </div>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm app-card text-center">
                <div className="card-body p-4">
                  <div className="app-icon-box mx-auto mb-3">
                    <FaCode />
                  </div>
                  <h4 className="fw-bold">Practice Problems</h4>
                  <p className="text-secondary mb-0">
                    Solve beginner to advanced coding problems with clean
                    problem statements and test cases.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm app-card text-center">
                <div className="card-body p-4">
                  <div className="app-icon-box mx-auto mb-3">
                    <FaTrophy />
                  </div>
                  <h4 className="fw-bold">Live Contests</h4>
                  <p className="text-secondary mb-0">
                    Join timed contests, compete with others, and improve your
                    speed and accuracy.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm app-card text-center">
                <div className="card-body p-4">
                  <div className="app-icon-box mx-auto mb-3">
                    <FaChartLine />
                  </div>
                  <h4 className="fw-bold">Track Progress</h4>
                  <p className="text-secondary mb-0">
                    Monitor solved questions, ranking, submissions, and your
                    growth over time.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-5">
        <div className="container py-lg-4">
          <div className="text-center mb-5">
            <span className="badge rounded-pill app-badge px-3 py-2">
              Simple Process
            </span>
            <h2 className="fw-bold mt-3">How It Works</h2>
            <p className="text-secondary mb-0">
              Get started in just a few simple steps.
            </p>
          </div>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm app-card text-center">
                <div className="card-body p-4">
                  <div className="app-icon-box mx-auto mb-3">
                    <FaUserPlus />
                  </div>
                  <div className="small fw-semibold text-primary mb-2">Step 1</div>
                  <h5 className="fw-bold">Create Account</h5>
                  <p className="text-secondary mb-0">
                    Sign up and set up your profile to start your coding
                    journey.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm app-card text-center">
                <div className="card-body p-4">
                  <div className="app-icon-box mx-auto mb-3">
                    <FaLaptopCode />
                  </div>
                  <div className="small fw-semibold text-primary mb-2">Step 2</div>
                  <h5 className="fw-bold">Solve Problems</h5>
                  <p className="text-secondary mb-0">
                    Practice daily and run your code directly in the online code
                    editor.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm app-card text-center">
                <div className="card-body p-4">
                  <div className="app-icon-box mx-auto mb-3">
                    <FaMedal />
                  </div>
                  <div className="small fw-semibold text-primary mb-2">Step 3</div>
                  <h5 className="fw-bold">Compete & Rank</h5>
                  <p className="text-secondary mb-0">
                    Join contests, improve your score, and appear on the
                    leaderboard.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-5 app-section">
        <div className="container py-lg-4">
          <div className="card border-0 shadow-sm text-center app-card">
            <div className="card-body p-4 p-lg-5">
              <span className="badge rounded-pill app-badge px-3 py-2">
                Get Started Today
              </span>
              <h2 className="fw-bold mt-3">
                Ready to start your coding journey?
              </h2>
              <p className="text-secondary mb-4">
                Practice smarter, compete better, and grow faster with JitCoder.
              </p>
              <Link to="/signup" className="btn btn-primary btn-lg px-5">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

export default HomePage;