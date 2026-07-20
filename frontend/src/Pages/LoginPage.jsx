import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  ArrowLeftOnRectangleIcon,
  EnvelopeIcon,
  LockClosedIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  SparklesIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../Contexts/AuthContext";

// Reusable InputField component defined outside to prevent re-creation on every render
const InputField = ({ icon: Icon, rightIcon, onRightIconClick, type = "text", ...props }) => (
  <div className="relative group">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-300 group-focus-within:text-purple-500 dark:group-focus-within:text-pink-400">
      <Icon className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500 dark:group-focus-within:text-pink-400 transition-colors" />
    </div>
    <input
      type={type}
      {...props}
      className="block w-full pl-10 pr-10 py-3 border border-gray-200 dark:border-gray-700 rounded-xl leading-5 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 dark:focus:ring-pink-500/50 focus:border-purple-500 dark:focus:border-pink-500 focus:bg-white dark:focus:bg-gray-800 transition-all duration-300 sm:text-sm"
    />
    {rightIcon && (
      <div
        className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        onClick={onRightIconClick}
      >
        {rightIcon}
      </div>
    )}
  </div>
);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Ref tracking for performance optimization
  const noiseLayerRef = useRef(null);

  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || "/profile";

  useEffect(() => {
    let animationFrameId;

    // ... (keep noise logic)

    const handleMouseMove = (e) => {
      // Use requestAnimationFrame to decouple from React rendering cycle
      if (animationFrameId) return;

      animationFrameId = requestAnimationFrame(() => {
        if (noiseLayerRef.current) {
          // Reduced sensitivity for smoother experience
          const x = (e.clientX / window.innerWidth) * 15;
          const y = (e.clientY / window.innerHeight) * 15;
          noiseLayerRef.current.style.transform = `translate(${-x}px, ${-y}px)`;
        }
        animationFrameId = null;
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  async function handleEmailLogin(e) {
    e.preventDefault();
    setLoading(true); setError(""); setSuccess("");
    try {
      await login(email, password);
      setSuccess("Welcome back! Redirecting...");
      setTimeout(() => navigate(redirectTo, { replace: true }), 1000);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || err.message || "Login failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setLoading(true); setError("");
    try {
      await loginWithGoogle();
      setSuccess("Authenticated! Taking you in...");
      setTimeout(() => navigate(redirectTo, { replace: true }), 1000);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || err.message || "Google Login failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }



  return (
    <div className="min-h-screen flex items-stretch overflow-hidden bg-white dark:bg-gray-950 transition-colors duration-500 relative">

      {/* Visual Background / Left Side */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900 items-center justify-center overflow-hidden">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-bl from-purple-800 via-violet-900 to-indigo-900 animate-gradient-xy opacity-90"></div>

        {/* Sky Animation / Clouds Effect with Filters - Optimized */}
        <div
          ref={noiseLayerRef}
          className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-150 contrast-150 mix-blend-overlay will-change-transform"
        ></div>

        {/* Marquee Background */}
        <div className="absolute inset-0 flex flex-col justify-center opacity-5 select-none pointer-events-none overflow-hidden">
          <div className="text-9xl font-black text-white animate-marquee whitespace-nowrap mb-8" style={{ transform: 'rotate(5deg)' }}>
            ACCESS • SECURE • INSTANT • VOUCHIFY •
          </div>
          <div className="text-9xl font-black text-white animate-marquee-reverse whitespace-nowrap" style={{ transform: 'rotate(5deg)' }}>
            LOGIN • TRADE • SAVE • GLOBAL •
          </div>
        </div>

        {/* 3D Floating Content - Hidden on Mobile */}
        <div className="relative z-10 p-12 max-w-2xl text-center perspective-1000 hidden lg:block">
          <div className="animate-float transform-style-3d">
            <div className="inline-block p-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8 shadow-2xl">
              <SparklesIcon className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-6xl font-black text-white mb-6 drop-shadow-lg tracking-tight">
              Welcome <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-rose-400">Back</span>
            </h1>
            <p className="text-xl text-purple-100 font-light leading-relaxed max-w-lg mx-auto">
              Ready to find your next great deal? Sign in to access your personalized marketplace.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 relative bg-white dark:bg-gray-950">
        {/* Mobile-only background gradient */}
        <div className="absolute inset-0 lg:hidden bg-gradient-to-br from-purple-500/10 to-indigo-500/10 dark:from-purple-900/20 dark:to-indigo-900/20 z-0"></div>

        <div className="w-full max-w-md space-y-8 relative z-10">
          <div className="text-center">
            <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 mb-2">
              Sign In
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              New to Vouchify?{" "}
              <Link to="/register" className="font-medium text-purple-600 dark:text-purple-400 hover:text-pink-600 dark:hover:text-pink-400 transition-colors duration-300">
                Create an account
              </Link>
            </p>
          </div>

          <div className="space-y-4">
            {error && (
              <div className="animate-fade-in p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 flex items-center shadow-sm">
                <ExclamationCircleIcon className="h-5 w-5 mr-3 flex-shrink-0" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}
            {success && (
              <div className="animate-fade-in p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-300 flex items-center shadow-sm">
                <CheckCircleIcon className="h-5 w-5 mr-3 flex-shrink-0" />
                <span className="text-sm font-medium">{success}</span>
              </div>
            )}

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-6 py-3.5 border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold shadow-sm hover:shadow-md transition-all duration-300 group"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="h-5 w-5 group-hover:scale-110 transition-transform" />
              Sign in with Google  
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-gray-950 text-gray-400 uppercase tracking-wider text-xs font-semibold">Or with email</span>
              </div>
            </div>

            <form className="space-y-5" onSubmit={handleEmailLogin}>
              <InputField
                id="email"
                name="email"
                type="email"
                required
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={EnvelopeIcon}
              />

              <div className="relative">
                <InputField
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={LockClosedIcon}
                  rightIcon={showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  onRightIconClick={() => setShowPassword(!showPassword)}
                />
                <div className="flex justify-end mt-1">
                  <Link to="/forgot-password" className="text-xs font-medium text-purple-600 hover:text-pink-600 dark:text-purple-400 dark:hover:text-pink-400 transition-colors">
                    Forgot Password?
                  </Link>
                </div>
              </div>


              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.02] active:scale-95 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed text-lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing In...
                  </span>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
