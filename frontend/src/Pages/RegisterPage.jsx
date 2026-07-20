import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  UserPlusIcon,
  EnvelopeIcon,
  LockClosedIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  UserIcon as UserOutlineIcon,
  BuildingStorefrontIcon,
  PhoneIcon,
  TicketIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../Contexts/AuthContext";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    businessName: "",
    referralCode: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register, loginWithGoogle } = useAuth();

  // Ref for background element to update transform directly
  const noiseLayerRef = useRef(null);

  useEffect(() => {
    let animationFrameId;

    const handleMouseMove = (e) => {
      // Calculate position but use requestAnimationFrame to prevent lag
      if (animationFrameId) return;

      animationFrameId = requestAnimationFrame(() => {
        if (noiseLayerRef.current) {
          // Reduced sensitivity and smoother math
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

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleGoogleLogin() {
    setLoading(true); setError("");
    try {
      await loginWithGoogle();
      setSuccess("Authentication success! Taking you in...");
      setTimeout(() => navigate("/profile"), 1500);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || err.message || "Google Login failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setSuccess("");

    const { displayName, email, password, confirmPassword, phone, businessName } = formData;
    if (password !== confirmPassword) {
      return setError("Passwords do not match.");
    }
    if (password.length < 6) {
      return setError("Password must be at least 6 characters.");
    }

    setLoading(true);
    try {
      const payload = { email, password, displayName };
      if (phone) payload.phone = phone;
      if (businessName) payload.businessName = businessName;
      if (formData.referralCode) payload.referralCode = formData.referralCode;

      await register(payload);
      setSuccess("Welcome to Vouchify! Redirecting...");
      setTimeout(() => navigate("/profile"), 1500);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || err.message || "Registration failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  const InputField = ({ icon: Icon, ...props }) => (
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-300 group-focus-within:text-indigo-500 dark:group-focus-within:text-fuchsia-400">
        <Icon className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 dark:group-focus-within:text-fuchsia-400 transition-colors" />
      </div>
      <input
        {...props}
        className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl leading-5 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:focus:ring-fuchsia-500/50 focus:border-indigo-500 dark:focus:border-fuchsia-500 focus:bg-white dark:focus:bg-gray-800 transition-all duration-300 sm:text-sm"
      />
    </div>
  );

  return (
    <div className="min-h-screen flex items-stretch overflow-hidden bg-white dark:bg-gray-950 transition-colors duration-500 relative">

      {/* Visual Background / Left Side */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900 items-center justify-center overflow-hidden">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-700 to-fuchsia-800 animate-gradient-xy opacity-90"></div>

        {/* Sky Animation / Clouds Effect with Filters - Optimized with Ref */}
        <div
          ref={noiseLayerRef}
          className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-150 contrast-150 mix-blend-overlay will-change-transform"
        ></div>

        {/* Marquee Background */}
        <div className="absolute inset-0 flex flex-col justify-center opacity-5 select-none pointer-events-none overflow-hidden">
          <div className="text-9xl font-black text-white animate-marquee whitespace-nowrap mb-8" style={{ transform: 'rotate(-5deg)' }}>
            SECURE • FAST • PREMIUM • VOUCHIFY •
          </div>
          <div className="text-9xl font-black text-white animate-marquee-reverse whitespace-nowrap" style={{ transform: 'rotate(-5deg)' }}>
            GLOBAL • TRUSTED • INSTANT • SAVINGS •
          </div>
        </div>

        {/* 3D Floating Content - Hidden on Mobile to save space/clutter, visible on Desktop */}
        <div className="relative z-10 p-12 max-w-2xl text-center perspective-1000 hidden lg:block">
          <div className="animate-float transform-style-3d">
            <div className="inline-block p-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8 shadow-2xl">
              <TicketIcon className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-6xl font-black text-white mb-6 drop-shadow-lg tracking-tight">
              Join now into an  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-400">Vouchify</span> Community
            </h1>
            <p className="text-xl text-indigo-100 font-light leading-relaxed max-w-lg mx-auto">
              Unlock unused vouchers, enable secure payment modes, and access an advanced voucher marketplace for seamless Trading.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side: Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 relative bg-white dark:bg-gray-950">
        {/* Mobile-only background gradient */}
        <div className="absolute inset-0 lg:hidden bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-900/20 dark:to-purple-900/20 z-0"></div>

        <div className="w-full max-w-md space-y-8 relative z-10">
          <div className="text-center">
            <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-fuchsia-600 dark:from-indigo-400 dark:to-fuchsia-400 mb-2">
              Create Account
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Already a member?{" "}
              <Link to="/login" className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-fuchsia-600 dark:hover:text-fuchsia-400 transition-colors duration-300">
                Sign in
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
              Sign up with Google
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-gray-950 text-gray-400 uppercase tracking-wider text-xs font-semibold">Or continue with email</span>
              </div>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputField
                  id="displayName"
                  name="displayName"
                  type="text"
                  required
                  placeholder="Full Name"
                  value={formData.displayName}
                  onChange={handleChange}
                  icon={UserOutlineIcon}
                />
                <InputField
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Phone (Optional)"
                  value={formData.phone}
                  onChange={handleChange}
                  icon={PhoneIcon}
                />
              </div>

              <InputField
                id="email"
                name="email"
                type="email"
                required
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                icon={EnvelopeIcon}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputField
                  id="businessName"
                  name="businessName"
                  type="text"
                  placeholder="Business (Optional)"
                  value={formData.businessName}
                  onChange={handleChange}
                  icon={BuildingStorefrontIcon}
                />
                <InputField
                  id="referralCode"
                  name="referralCode"
                  type="text"
                  placeholder="Referral Code (Optional)"
                  value={formData.referralCode}
                  onChange={handleChange}
                  icon={TicketIcon}
                />
              </div>

              <InputField
                id="password"
                name="password"
                type="password"
                required
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                icon={LockClosedIcon}
              />

              <InputField
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                icon={LockClosedIcon}
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-500 hover:to-fuchsia-500 text-white font-bold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.02] active:scale-95 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed text-lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </span>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            <p className="text-xs text-center text-gray-400 dark:text-gray-500 mt-6">
              By creating an account, you agree to our <Link to="/terms" className="underline hover:text-indigo-500">Terms of Service</Link> and <Link to="/privacy" className="underline hover:text-indigo-500">Privacy Policy</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
