// src/components/SignIn.jsx  (new version)
import { useAuth } from "../Contexts/AuthContext";   // path to your context

export default function SignIn() {
  const { loginWithGoogle } = useAuth();             // helper we added in context

  async function handleLogin() {
    try {
      await loginWithGoogle();                       // opens the popup
    } catch (err) {
      console.error("Login error:", err.message);
    }
  }

  return (
    <button
      onClick={handleLogin}
      className="mt-4 rounded bg-blue-600 px-4 py-2 text-white"
    >
      Sign in with Google
    </button>
  );
}
