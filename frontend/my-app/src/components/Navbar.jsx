import { Link, useNavigate } from "react-router-dom";
import React, { useEffect, useRef, useState } from "react";
import ThemeToggle from "./ThemeToggle";
import API from "../services/api";
import "../styles/navbar.css";

function Navbar() {
  const [user, setUser] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("access");
    const savedUsername =
      localStorage.getItem("username") || localStorage.getItem("name");

    if (token && savedUsername) {
      setUser({ name: savedUsername, username: savedUsername });
    }

    if (token) {
      API.get("/user/profile/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          const profileUser = res.data;
          setUser(profileUser);

          if (profileUser?.username) {
            localStorage.setItem("username", profileUser.username);
          }

          if (profileUser?.name) {
            localStorage.setItem("name", profileUser.name);
          }
        })
        .catch((err) => {
          console.error("Profile fetch error:", err);

          if (
            err.response?.status === 401 ||
            err.response?.status === 403
          ) {
            localStorage.removeItem("access");
            localStorage.removeItem("refresh");
            localStorage.removeItem("username");
            localStorage.removeItem("name");

            setUser(null);
            navigate("/login", { replace: true });
          }
        });
    }
  }, [navigate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setOpenDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("username");
    localStorage.removeItem("name");

    setUser(null);
    setOpenDropdown(false);

    navigate("/login", { replace: true });
  };

  const displayName = user?.name || user?.username || "User";

  const getInitial = () => {
    return displayName.charAt(0).toUpperCase();
  };

  const closeMobileMenu = () => {
    const navbar = document.getElementById("mainNavbar");

    if (navbar) {
      const bsCollapse =
        window.bootstrap?.Collapse.getInstance(navbar) ||
        new window.bootstrap.Collapse(navbar, {
          toggle: false,
        });

      bsCollapse.hide();
    }

    setOpenDropdown(false);
  };

  return (
    <nav className="navbar navbar-expand-lg border-bottom app-navbar sticky-top">
      <div className="container">
        <Link
          className="navbar-brand fw-bold fs-4 d-flex align-items-center gap-2"
          to="/"
          onClick={closeMobileMenu}
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
          onClick={() => setOpenDropdown(false)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className="collapse navbar-collapse" id="mainNavbar">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-lg-center gap-lg-2">
            <li className="nav-item">
              <Link
                className="nav-link fw-medium"
                to="/"
                onClick={closeMobileMenu}
              >
                Home
              </Link>
            </li>

            <li className="nav-item">
              <Link
                className="nav-link fw-medium"
                to="/problems"
                onClick={closeMobileMenu}
              >
                Problems
              </Link>
            </li>

            <li className="nav-item">
              <Link
                className="nav-link fw-medium"
                to="/contests"
                onClick={closeMobileMenu}
              >
                Contests
              </Link>
            </li>

            {user ? (
              <li
                className="nav-item position-relative ms-lg-2"
                ref={dropdownRef}
              >
                <button
                  type="button"
                  className="btn d-flex align-items-center gap-2 border-0 bg-transparent user-menu-btn"
                  onClick={() => setOpenDropdown(!openDropdown)}
                >
                  <div
                    className="d-flex align-items-center justify-content-center fw-bold text-white"
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      background:
                        "linear-gradient(135deg,var(--primary),#6f42c1)",
                    }}
                  >
                    {getInitial()}
                  </div>

                  <div className="d-none d-md-flex flex-column text-start lh-sm">
                    <span className="user-name">{displayName}</span>
                    <small className="user-subtitle">Signed in</small>
                  </div>
                </button>

                {openDropdown && (
                  <div
                    className="position-absolute end-0 mt-2 user-dropdown"
                    style={{ zIndex: 1050 }}
                  >
                    <div className="user-dropdown-header">
                      <div className="user-name">{displayName}</div>
                      <div className="user-subtitle">Welcome back</div>
                    </div>

                    <Link
                      to="/dashboard"
                      className="user-dropdown-item"
                      onClick={closeMobileMenu}
                    >
                      📊 Dashboard
                    </Link>

                    <Link
                      to="/contests"
                      className="user-dropdown-item"
                      onClick={closeMobileMenu}
                    >
                      🏆 My Contests
                    </Link>

                    <Link
                      to="/problems"
                      className="user-dropdown-item"
                      onClick={closeMobileMenu}
                    >
                      💻 Problems
                    </Link>

                    <hr className="m-1" />

                    <button
                      className="user-dropdown-item logout-item border-0 bg-transparent w-100 text-start"
                      onClick={handleLogout}
                    >
                      <i className="bi bi-box-arrow-right"></i>
                      Logout
                    </button>
                  </div>
                )}
              </li>
            ) : (
              <>
                <li className="nav-item mt-2 mt-lg-0">
                  <Link
                    className="btn btn-outline-primary btn-sm px-3"
                    to="/login"
                    onClick={closeMobileMenu}
                  >
                    Login
                  </Link>
                </li>

                <li className="nav-item mt-2 mt-lg-0">
                  <Link
                    className="btn btn-primary btn-sm px-3"
                    to="/register"
                    onClick={closeMobileMenu}
                  >
                    Sign Up
                  </Link>
                </li>
              </>
            )}

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