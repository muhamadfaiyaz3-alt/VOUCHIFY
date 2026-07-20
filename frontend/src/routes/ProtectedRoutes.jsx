// src/routes/ProtectedRoutes.jsx


// src/routes/ProtectedRoutes.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../Contexts/AuthContext";  // ← new import

/**
 * Gate‑keeps every private route.
 * • While Firebase is still loading → show a spinner.
 * • If user is logged in        → render the matched child route.
 * • Otherwise                   → redirect to /login.
 */
const ProtectedRoutes = () => {
  const { isLoggedIn, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen grid place-content-center text-lg">
        Loading…
      </div>
    );
  }

  return isLoggedIn ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoutes;

