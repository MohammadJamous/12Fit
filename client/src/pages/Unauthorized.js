import { Link } from "react-router-dom";

function Unauthorized() {
  return (
    <div className="container py-5 text-center">
      <div className="card shadow border-0 rounded-4 p-5 mx-auto" style={{ maxWidth: "650px" }}>
        <h1 className="display-1 fw-bold text-warning">403</h1>
        <h2 className="mb-3">Access Denied</h2>
        <p className="text-muted mb-4">
          You do not have permission to access this page.
        </p>

        <Link to="/" className="btn btn-primary rounded-pill px-4">
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default Unauthorized;