import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="footer-section text-white mt-auto">
      <div className="container py-5">
        <div className="row g-4">
          <div className="col-lg-4 col-md-6">
            <h4 className="fw-bold text-white">12Fit</h4>
            <p className="text-light mt-3">
              A modern full-stack fitness platform designed to help users build
              personalized workout and diet plans with a smart and attractive
              experience.
            </p>
          </div>

          <div className="col-lg-2 col-md-6">
            <h6 className="fw-bold mb-3">Links</h6>
            <ul className="list-unstyled footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/dashboard">Dashboard</Link></li>
              <li><Link to="/workout">Workout</Link></li>
              <li><Link to="/diet">Diet</Link></li>
            </ul>
          </div>

          <div className="col-lg-2 col-md-6">
            <h6 className="fw-bold mb-3">Account</h6>
            <ul className="list-unstyled footer-links">
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/register">Register</Link></li>
              <li><Link to="/products">Products</Link></li>
            </ul>
          </div>

          <div className="col-lg-4 col-md-6">
            <h6 className="fw-bold mb-3">Contact</h6>
            <p className="text-light mb-1">📧 support@12fit.com</p>
            <p className="text-light mb-3">📍 Palestine</p>

            <div className="d-flex gap-3">
              <span className="social-icon">🌐</span>
              <span className="social-icon">📘</span>
              <span className="social-icon">📸</span>
              <span className="social-icon">🐦</span>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom text-center py-3">
        <small>© 2026 12Fit. All rights reserved.</small>
      </div>
    </footer>
  );
}

export default Footer;