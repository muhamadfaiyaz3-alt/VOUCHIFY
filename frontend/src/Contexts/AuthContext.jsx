import { createContext, useContext, useEffect, useState, memo } from "react";
import PropTypes from "prop-types";
import client from "../api/client";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Handle Firebase Google redirect result after returning from Google
        const { getRedirectResult } = await import("firebase/auth");
        const { auth } = await import("../firebase");

        const result = await getRedirectResult(auth);

        if (result?.user) {
          const firebaseUser = result.user;

          const { data } = await client.post("/auth/google", {
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            googleUid: firebaseUser.uid,
          });

          localStorage.setItem("token", data.token);
          setUser(data.user);
          setLoading(false);
          return;
        }

        // Normal token-based login restore
        const token = localStorage.getItem("token");

        if (token) {
          const { data } = await client.get("/me");
          setUser(data.user);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const handleUnauthorized = () => {
      setUser(null);
      localStorage.removeItem("token");
      window.location.href = "/login";
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);

    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, []);

  const login = async (email, password) => {
    const { data } = await client.post("/auth/login", { email, password });
    localStorage.setItem("token", data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await client.post("/auth/register", payload);
    localStorage.setItem("token", data.token);
    setUser(data.user);
    return data.user;
  };

  const loginWithGoogle = async () => {
    const { signInWithRedirect } = await import("firebase/auth");
    const { auth, googleProvider } = await import("../firebase");

    await signInWithRedirect(auth, googleProvider);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/login";
  };

  const refreshUser = async () => {
    try {
      const { data } = await client.get("/me");
      setUser(data.user);
    } catch (error) {
      console.error("Failed to refresh user:", error);
    }
  };

  const value = {
    user,
    isLoggedIn: !!user,
    loading,
    login,
    register,
    loginWithGoogle,
    logout,
    refreshUser,
  };

  if (loading) {
    return (
      <div className="min-h-screen grid place-content-center text-lg">
        Loading...
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};

export default memo(AuthProvider);
