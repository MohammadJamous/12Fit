import { Navigate } from "react-router-dom";

function PublicOnlyRoute({ children }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (token) {
    return <Navigate to={(user.role === "admin" || user.role === "super_admin" )? "/dashboard" : "/"} replace />;
  }

  return children;
}

export default PublicOnlyRoute;