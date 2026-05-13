import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="container py-5 text-center">
      <div className="card shadow border-0 rounded-4 p-5 mx-auto" style={{ maxWidth: "650px" }}>
        <h1 className="display-1 fw-bold text-danger">404</h1>
        <h2 className="mb-3">Page Not Found</h2>
        <p className="text-muted mb-4">
          The page you are looking for does not exist or has been moved.
        </p>

        <Link to="/" className="btn btn-primary rounded-pill px-4">
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default NotFound;