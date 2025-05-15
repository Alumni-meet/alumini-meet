import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute: React.FC = () => {
  const isAuth = !!sessionStorage.getItem("user");
  const role = sessionStorage.getItem("role");

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  if (role === "admin") {
    return <Navigate to="/admin" replace />;
  }
  return <Outlet />;
};

export default ProtectedRoute;
