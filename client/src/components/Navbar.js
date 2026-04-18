import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import logo from "../assets/images/logo.png";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  const [notifications] = useState([
    "Welcome to 12Fit",
    "Your fitness plan is ready",
    "Check your dashboard updates",
  ]);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark-mode");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const isActive = (path) => (location.pathname === path ? "active-link" : "");

  return (
    <nav className="navbar navbar-expand-lg shadow-sm py-3 sticky-top custom-navbar">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <img src={logo} alt="logo" className="navbar-logo" />
          <span className="fw-bold text-white">12Fit</span>
        </Link>

        <button
          className="navbar-toggler border-0 shadow-none"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbar"
          aria-controls="navbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbar">
          <ul className="navbar-nav me-auto ms-lg-4">
            <li className="nav-item">
              <Link className={`nav-link ${isActive("/")}`} to="/">
                Home
              </Link>
            </li>

            {user?.role === "admin" && (
              <li className="nav-item">
                <Link
                  className={`nav-link ${isActive("/dashboard")}`}
                  to="/dashboard"
                >
                  Dashboard
                </Link>
              </li>
            )}

            <li className="nav-item">
              <Link className={`nav-link ${isActive("/workout")}`} to="/workout">
                Workout
              </Link>
            </li>

            <li className="nav-item">
              <Link className={`nav-link ${isActive("/diet")}`} to="/diet">
                Diet
              </Link>
            </li>

            <li className="nav-item">
              <Link className={`nav-link ${isActive("/products")}`} to="/products">
                Products
              </Link>
            </li>

             <li className="nav-item">
              <Link className={`nav-link ${isActive("/Progress")}`} to="/Progress">
                Progress
              </Link>
            </li>
          </ul>

          <div className="d-flex align-items-lg-center flex-column flex-lg-row gap-2 gap-lg-3 mt-3 mt-lg-0 navbar-actions">
            <button
              className="theme-icon-btn"
              onClick={() => setDarkMode(!darkMode)}
              title="Toggle theme"
            >
              {darkMode ? "☀️" : "🌙"}
            </button>

            <div className="dropdown w-100 w-lg-auto">
              <button
                className="btn btn-outline-light btn-sm dropdown-toggle w-100 w-lg-auto"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                🔔 Notifications
              </button>

              <ul className="dropdown-menu dropdown-menu-end shadow border-0 rounded-4">
                {notifications.map((item, index) => (
                  <li key={index}>
                    <span className="dropdown-item-text px-3 py-2 d-block">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {!user ? (
              <>
                <Link className="btn btn-outline-light w-100 w-lg-auto" to="/login">
                  Login
                </Link>

                <Link className="btn btn-primary w-100 w-lg-auto" to="/register">
                  Register
                </Link>
              </>
            ) : (
              <div className="dropdown w-100 w-lg-auto">
                <button
                  className="btn btn-outline-info btn-sm dropdown-toggle w-100 w-lg-auto"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  👤 {user.name}
                </button>

                <ul className="dropdown-menu dropdown-menu-end shadow border-0 rounded-4">
                  <li>
                    <span className="dropdown-item-text px-3 py-2 d-block">
                      {user.email}
                    </span>
                  </li>
                  <li>
                    <span className="dropdown-item-text px-3 py-2 d-block">
                      Role: {user.role}
                    </span>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>

                  {user?.role === "admin" && (
                    <li>
                      <Link className="dropdown-item" to="/dashboard">
                        Dashboard
                      </Link>
                    </li>
                  )}

                  <li>
                    <button
                      className="dropdown-item text-danger"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;