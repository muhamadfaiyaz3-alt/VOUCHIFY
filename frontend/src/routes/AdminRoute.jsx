import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../Contexts/AuthContext";

const AdminRoute = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen grid place-content-center text-lg">
                Loading...
            </div>
        );
    }

    if (!user || user.role !== "admin") {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default AdminRoute;
