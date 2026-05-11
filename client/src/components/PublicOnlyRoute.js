import { Navigate } from "react-router-dom";

function PublicOnlyRoute({ children }) {
 const user = JSON.parse(localStorage.getItem("user") || "{}");

if (token) {
  return <Navigate to={user.role === "admin" ? "/dashboard" : "/"} replace />;
}
  return children;
}

export default PublicOnlyRoute;