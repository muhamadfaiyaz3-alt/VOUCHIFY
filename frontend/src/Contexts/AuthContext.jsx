import { createContext, useContext, useEffect, useState, memo } from "react";
import PropTypes from "prop-types";
import client from "../api/client";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const syncGoogleUserWithBackend = async (firebaseUser) => {
    const { data } = await client.post("/auth/google", {
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      googleUid: firebaseUser.uid,
    });

    localStorage.setItem("token", data.token);
    setUser(data.user);
    return data.user;
  };

  useEffect(() => {
    let unsubscribe = null;

    const initAuth = async () => {
      try {
        const { auth } = await import("../firebase");
        const { getRedirectResult, onAuthStateChanged } = await import(
          "firebase/auth"
        );

        // 1. Try to catch Google redirect result
        try {
          const result = await getRedirectResult(auth);

          if (result?.user) {
            await syncGoogleUserWithBackend(result.user);
            setLoading(false);
            window.location.href = "/";
            return;
          }
        } catch (redirectError) {
          console.error("Google redirect result error:", redirectError);
        }

        // 2. Restore normal JWT login
        const token = localStorage.getItem("token");

        if (token) {
          try {
            const { data } = await client.get("/me");
            setUser(data.user);
            setLoading(false);
            return;
          } catch (error) {
            console.error("Failed to fetch user profile:", error);
            localStorage.removeItem("token");
          }
        }

        // 3. Fallback: Firebase user exists but backend token missing
        unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          try {
            if (firebaseUser && !localStorage.getItem("token")) {
              await syncGoogleUserWithBackend(firebaseUser);
              window.location.href = "/";
              return;
            }
          } catch (error) {
            console.error("Failed to sync Firebase user with backend:", error);
          } finally {
            setLoading(false);
          }
        });
      } catch (error) {
        console.error("Auth initialization error:", error);
        localStorage.removeItem("token");
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
      if (unsubscribe) unsubscribe();
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

  const logout = async () => {
    try {
      const { signOut } = await import("firebase/auth");
      const { auth } = await import("../firebase");
      await signOut(auth);
    } catch (error) {
      console.error("Firebase logout error:", error);
    }

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