import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const INTRO_STORAGE_KEY = "vouchify_intro_played";

// Where to send first-time visitors once the intro finishes.
// Your app's homepage route is "/" (there is no "/home" route defined
// in App.jsx) — change this constant if you add one later.
const POST_INTRO_PATH = "/";

// Decided synchronously, during the very first render — BEFORE anything
// paints to the screen. This is what eliminates the content flash: we
// never render "nothing" on the first frame while waiting for an effect.
const getInitialPhase = () => {
  try {
    return sessionStorage.getItem(INTRO_STORAGE_KEY) === "true" ? "hidden" : "show";
  } catch {
    // sessionStorage can throw in some privacy modes — fail safe by showing intro
    return "show";
  }
};

const IntroSplash = () => {
  const [phase, setPhase] = useState(getInitialPhase);
  const justPlayedRef = useRef(false); // true only if THIS load actually ran the animation
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (phase !== "show") return;

    justPlayedRef.current = true;

    const leaveTimer = window.setTimeout(() => {
      setPhase("leave");
    }, 3600);

    const hideTimer = window.setTimeout(() => {
      try {
        sessionStorage.setItem(INTRO_STORAGE_KEY, "true");
      } catch {
        // ignore — worst case the intro replays next tab
      }
      setPhase("hidden");
    }, 4000);

    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(hideTimer);
    };
  }, [phase]);

  // Optional: send first-time visitors to the homepage once the intro
  // completes — but only if THIS load actually played the animation
  // (never redirects a returning visitor away from a deep link like
  // /vouchers/123, and never fires again once the splash is gone).
  useEffect(() => {
    if (phase === "hidden" && justPlayedRef.current) {
      justPlayedRef.current = false;
      if (location.pathname !== POST_INTRO_PATH) {
        navigate(POST_INTRO_PATH, { replace: true });
      }
    }
  }, [phase, navigate, location.pathname]);

  if (phase === "hidden") return null;

  return (
    <div
      className={`vouchify-intro-splash ${
        phase === "leave" ? "vouchify-intro-splash--leave" : ""
      }`}
    >
      <style>
        {`
          .vouchify-intro-splash {
            position: fixed;
            inset: 0;
            z-index: 999999;
            display: grid;
            place-items: center;
            overflow: hidden;
            background:
              radial-gradient(circle at 50% 35%, rgba(255,255,255,0.98) 0%, rgba(230,232,242,0.96) 38%, rgba(15,23,42,0.94) 100%);
            opacity: 1;
            pointer-events: auto;
            transition: opacity 400ms ease;
          }

          .vouchify-intro-splash::before {
            content: "";
            position: absolute;
            inset: -25%;
            background:
              radial-gradient(circle at 25% 30%, rgba(124,58,237,0.28), transparent 30%),
              radial-gradient(circle at 72% 70%, rgba(14,165,233,0.22), transparent 32%);
            filter: blur(18px);
            animation: introGlowMove 3.2s ease-in-out infinite alternate;
          }

          .vouchify-intro-splash--leave {
            opacity: 0;
            pointer-events: none;
          }

          .vouchify-intro-splash__image {
            position: relative;
            z-index: 2;
            width: min(78vw, 560px);
            max-height: 68vh;
            object-fit: contain;
            filter: drop-shadow(0 45px 90px rgba(0,0,0,0.38));
            transform-origin: center;
            animation: introPhoneShow 2.2s cubic-bezier(0.16, 1, 0.3, 1) both;
          }

          .vouchify-intro-splash--leave .vouchify-intro-splash__image {
            animation: introPhoneToHero 400ms cubic-bezier(0.65, 0, 0.35, 1) forwards;
          }

          .vouchify-intro-splash__brand {
            position: absolute;
            z-index: 3;
            left: 50%;
            bottom: 8vh;
            width: min(92vw, 720px);
            transform: translateX(-50%);
            text-align: center;
            color: white;
            animation: introBrandShow 1.5s ease 0.45s both;
          }

          .vouchify-intro-splash--leave .vouchify-intro-splash__brand {
            animation: introBrandHide 400ms ease forwards;
          }

          .vouchify-intro-splash__brand strong {
            display: block;
            font-size: clamp(2.6rem, 7vw, 5.4rem);
            line-height: 0.95;
            font-weight: 1000;
            letter-spacing: -0.07em;
            text-shadow: 0 12px 38px rgba(0,0,0,0.38);
          }

          .vouchify-intro-splash__brand span {
            display: block;
            margin-top: 0.85rem;
            font-size: clamp(0.72rem, 1.65vw, 1.05rem);
            font-weight: 900;
            letter-spacing: 0.22em;
            text-transform: uppercase;
            opacity: 0.92;
            text-shadow: 0 8px 24px rgba(0,0,0,0.32);
          }

          @keyframes introPhoneShow {
            0% {
              opacity: 0;
              transform: translate3d(0, 42px, 0) scale(0.74) rotate(-4deg);
              filter: blur(8px) drop-shadow(0 45px 90px rgba(0,0,0,0.38));
            }
            35% {
              opacity: 1;
              filter: blur(0) drop-shadow(0 45px 90px rgba(0,0,0,0.38));
            }
            72% {
              transform: translate3d(0, -8px, 0) scale(1.04) rotate(1deg);
            }
            100% {
              opacity: 1;
              transform: translate3d(0, 0, 0) scale(1) rotate(0deg);
            }
          }

          @keyframes introPhoneToHero {
            0% { opacity: 1; transform: scale(1); }
            100% { opacity: 0; transform: scale(1.06); }
          }

          @keyframes introBrandShow {
            from { opacity: 0; transform: translate3d(-50%, 18px, 0); }
            to { opacity: 1; transform: translate3d(-50%, 0, 0); }
          }

          @keyframes introBrandHide {
            to { opacity: 0; transform: translate3d(-50%, 12px, 0); }
          }

          @keyframes introGlowMove {
            from { transform: translate3d(-18px, -14px, 0) scale(1); }
            to { transform: translate3d(18px, 14px, 0) scale(1.08); }
          }

          @media (max-width: 640px) {
            .vouchify-intro-splash__image { width: min(96vw, 430px); }
          }

          @media (prefers-reduced-motion: reduce) {
            .vouchify-intro-splash *,
            .vouchify-intro-splash::before {
              animation: none !important;
            }
            .vouchify-intro-splash__image,
            .vouchify-intro-splash__brand {
              opacity: 1 !important;
              transform: translate3d(0,0,0) scale(1) !important;
            }
            .vouchify-intro-splash__brand { transform: translateX(-50%) !important; }
          }
        `}
      </style>

      <img
        className="vouchify-intro-splash__image"
        src="/gpay-anime.png"
        alt="Vouchify rewards preview"
      />

      <div className="vouchify-intro-splash__brand">
        <strong>Vouchify</strong>
        <span>Smart Voucher Exchange</span>
      </div>
    </div>
  );
};

export default IntroSplash;