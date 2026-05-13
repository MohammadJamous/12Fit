import { Link } from "react-router-dom";

function ServerError() {
  return (
    <div className="container py-5 text-center">
      <div className="card shadow border-0 rounded-4 p-5 mx-auto" style={{ maxWidth: "650px" }}>
        <h1 className="display-1 fw-bold text-danger">500</h1>
        <h2 className="mb-3">Server Error</h2>
        <p className="text-muted mb-4">
          Something went wrong on the server. Please try again later.
        </p>

        <Link to="/" className="btn btn-primary rounded-pill px-4">
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default ServerError;