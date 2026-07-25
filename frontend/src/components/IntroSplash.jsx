import { useEffect, useState } from "react";

const INTRO_STORAGE_KEY = "vouchify_intro_played";

const getInitialVisible = () => {
  try {
    return localStorage.getItem(INTRO_STORAGE_KEY) !== "true";
  } catch {
    return true;
  }
};

const IntroSplash = () => {
  const [visible, setVisible] = useState(getInitialVisible);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!visible) return;

    const leaveTimer = window.setTimeout(() => {
      setLeaving(true);
    }, 2600);

    const hideTimer = window.setTimeout(() => {
      try {
        localStorage.setItem(INTRO_STORAGE_KEY, "true");
      } catch {
        // ignore storage errors
      }

      setVisible(false);
    }, 3200);

    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(hideTimer);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div className={`vouchify-intro ${leaving ? "vouchify-intro--leave" : ""}`}>
      <style>
        {`
          .vouchify-intro {
            position: fixed;
            inset: 0;
            z-index: 999999;
            display: grid;
            place-items: center;
            overflow: hidden;
            background:
              radial-gradient(circle at 50% 38%, rgba(255,255,255,0.98) 0%, rgba(235,238,248,0.96) 42%, rgba(15,23,42,0.96) 100%);
            opacity: 1;
            transition: opacity 600ms ease;
          }

          .vouchify-intro--leave {
            opacity: 0;
            pointer-events: none;
          }

          .vouchify-intro::before {
            content: "";
            position: absolute;
            inset: -30%;
            background:
              radial-gradient(circle at 30% 30%, rgba(79,70,229,0.26), transparent 34%),
              radial-gradient(circle at 72% 70%, rgba(6,182,212,0.22), transparent 36%);
            filter: blur(22px);
            animation: introGlow 3s ease-in-out infinite alternate;
          }

          .vouchify-intro__content {
            position: relative;
            z-index: 2;
            display: grid;
            place-items: center;
            text-align: center;
            transform-origin: center;
            animation: introContentIn 1.4s cubic-bezier(0.16, 1, 0.3, 1) both;
          }

          .vouchify-intro--leave .vouchify-intro__content {
            animation: introContentOut 600ms ease forwards;
          }

          .vouchify-intro__image {
            width: min(72vw, 500px);
            max-height: 62vh;
            object-fit: contain;
            filter: drop-shadow(0 42px 80px rgba(0,0,0,0.35));
          }

          .vouchify-intro__brand {
            margin-top: -1.8rem;
            color: white;
          }

          .vouchify-intro__brand strong {
            display: block;
            font-size: clamp(2.5rem, 7vw, 5.2rem);
            line-height: 0.95;
            font-weight: 1000;
            letter-spacing: -0.07em;
            text-shadow: 0 14px 42px rgba(0,0,0,0.42);
          }

          .vouchify-intro__brand span {
            display: block;
            margin-top: 0.8rem;
            font-size: clamp(0.72rem, 1.55vw, 1rem);
            font-weight: 900;
            letter-spacing: 0.22em;
            text-transform: uppercase;
            opacity: 0.9;
            text-shadow: 0 8px 24px rgba(0,0,0,0.34);
          }

          @keyframes introContentIn {
            0% {
              opacity: 0;
              transform: translateY(34px) scale(0.84);
              filter: blur(8px);
            }
            45% {
              opacity: 1;
              filter: blur(0);
            }
            100% {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          @keyframes introContentOut {
            to {
              opacity: 0;
              transform: translateY(-10px) scale(1.04);
              filter: blur(4px);
            }
          }

          @keyframes introGlow {
            from {
              transform: translate3d(-16px, -12px, 0) scale(1);
            }
            to {
              transform: translate3d(16px, 12px, 0) scale(1.08);
            }
          }

          @media (max-width: 640px) {
            .vouchify-intro__image {
              width: min(94vw, 420px);
            }

            .vouchify-intro__brand {
              margin-top: -1rem;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .vouchify-intro,
            .vouchify-intro *,
            .vouchify-intro::before {
              animation: none !important;
              transition: none !important;
            }
          }
        `}
      </style>

      <div className="vouchify-intro__content">
        <img
          className="vouchify-intro__image"
          src="/gpay-anime.png"
          alt="Vouchify rewards preview"
        />

        <div className="vouchify-intro__brand">
          <strong>Vouchify</strong>
          <span>Smart Voucher Exchange</span>
        </div>
      </div>
    </div>
  );
};

export default IntroSplash;