import { createContext, useContext, useEffect, useState, memo } from "react";
import PropTypes from "prop-types";
import client from "../api/client";

/* ------------------------------------------------------------------ */
/* Context                                                            */
/* ------------------------------------------------------------------ */
export const AuthContext = createContext(null);

/* ------------------------------------------------------------------ */
/* Provider                                                           */
/* ------------------------------------------------------------------ */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const { data } = await client.get("/me");
          setUser(data.user);
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
          localStorage.removeItem("token");
        }
      }
      setLoading(false);
    };
    initAuth();

    const handleUnauthorized = () => {
      setUser(null);
      localStorage.removeItem("token");
      window.location.href = "/login";
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);

    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  /* --------- helpers --------- */
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
    // Import dynamically to avoid issues if firebase isn't fully set up yet
    const { signInWithPopup } = await import("firebase/auth");
    const { auth, googleProvider } = await import("../firebase");

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const { user: firebaseUser } = result;

      // Send firebase user details to backend to create/login local user
      const { data } = await client.post("/auth/google", {
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        googleUid: firebaseUser.uid
      });

      localStorage.setItem("token", data.token);
      setUser(data.user);
      return data.user;
    } catch (error) {
      console.error("Google Login Error:", error);
      throw error;
    }
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

  /* --------- memoised value --------- */
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

  /* --------- splash while loading --------- */
  if (loading) {
    return (
      <div className="min-h-screen grid place-content-center text-lg">
        Loading...
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/* ------------------------------------------------------------------ */
/* Hook                                                               */
/* ------------------------------------------------------------------ */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};

/* ------------------------------------------------------------------ */
/* Default export for convenience                                     */
/* ------------------------------------------------------------------ */
export default memo(AuthProvider);
