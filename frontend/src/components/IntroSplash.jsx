import { useEffect, useState } from "react";

// Change this if you ever need to force the intro to play again for everyone
// (e.g. after a rebrand). Bumping the key invalidates previously stored "seen" flags.
const INTRO_STORAGE_KEY = "vouchify_intro_played";

// --- Timing constants -------------------------------------------------
// These drive both the JS timers and are mirrored into CSS custom properties
// below, so the two can never drift out of sync. Tweak here only.
const TOTAL_DURATION_MS = 3200; // full lifetime of the splash, including exit
const EXIT_DURATION_MS = 600; // length of the fade/lift-out transition
const EXIT_START_MS = TOTAL_DURATION_MS - EXIT_DURATION_MS; // when exit begins
const REDUCED_MOTION_DURATION_MS = 450; // fast, near-instant path for reduced motion

// Dev helper: call IntroSplash.reset() from the console to replay the intro
// without clearing all of localStorage.
const resetIntro = () => {
  try {
    localStorage.removeItem(INTRO_STORAGE_KEY);
  } catch {
    // ignore storage errors
  }
};

const prefersReducedMotion = () => {
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
};

const IntroSplash = () => {
  // `null` = "not yet determined" (safe default for SSR: server and the
  // first client render both produce null/nothing, avoiding a hydration
  // mismatch). The real localStorage check happens after mount, client-only.
  const [visible, setVisible] = useState(null);
  const [leaving, setLeaving] = useState(false);

  // Decide, once mounted on the client, whether the intro should play.
  useEffect(() => {
    let shouldShow = true;
    try {
      shouldShow = localStorage.getItem(INTRO_STORAGE_KEY) !== "true";
    } catch {
      // localStorage unavailable (privacy mode, SSR edge cases, etc.) -
      // fall back to showing the intro once for this session.
    }
    setVisible(shouldShow);
  }, []);

  // Drive the entrance -> hold -> exit -> unmount lifecycle.
  useEffect(() => {
    if (!visible) return;

    const reduceMotion = prefersReducedMotion();
    const exitStart = reduceMotion ? 0 : EXIT_START_MS;
    const totalDuration = reduceMotion
      ? REDUCED_MOTION_DURATION_MS
      : TOTAL_DURATION_MS;

    const leaveTimer = window.setTimeout(() => {
      setLeaving(true);
    }, exitStart);

    const hideTimer = window.setTimeout(() => {
      try {
        localStorage.setItem(INTRO_STORAGE_KEY, "true");
      } catch {
        // ignore storage errors
      }
      setVisible(false);
    }, totalDuration);

    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(hideTimer);
    };
  }, [visible]);

  const dismiss = () => {
    if (leaving) return; // already animating out, ignore repeat triggers
    setLeaving(true);
    try {
      localStorage.setItem(INTRO_STORAGE_KEY, "true");
    } catch {
      // ignore storage errors
    }
    window.setTimeout(() => setVisible(false), EXIT_DURATION_MS);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Escape") dismiss();
  };

  if (!visible) return null;

  return (
    <div
      className={`vouchify-intro ${leaving ? "vouchify-intro--leave" : ""}`}
      style={{
        "--vi-exit-duration": `${EXIT_DURATION_MS}ms`,
      }}
      // Purely decorative overlay: hide it from assistive tech entirely
      // rather than trying to announce or focus-trap it.
      aria-hidden="true"
      onClick={dismiss}
      onKeyDown={handleKeyDown}
    >
      <style>
        {`
          .vouchify-intro {
            position: fixed;
            inset: 0;
            z-index: 999999;
            display: grid;
            place-items: center;
            overflow: hidden;
            cursor: pointer;
            background:
              radial-gradient(circle at 50% 38%, rgba(255,255,255,0.98) 0%, rgba(235,238,248,0.96) 42%, rgba(15,23,42,0.96) 100%);
            opacity: 1;
            transition: opacity var(--vi-exit-duration) ease;
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
            animation: introContentOut var(--vi-exit-duration) ease forwards;
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

          .vouchify-intro__hint {
            position: absolute;
            bottom: clamp(1.25rem, 4vh, 2.5rem);
            left: 50%;
            transform: translateX(-50%);
            z-index: 2;
            font-size: 0.7rem;
            font-weight: 700;
            letter-spacing: 0.14em;
            text-transform: uppercase;
            color: rgba(255,255,255,0.55);
            opacity: 0;
            animation: introHintIn 600ms ease 1.6s forwards;
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

          @keyframes introHintIn {
            to { opacity: 1; }
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
            .vouchify-intro {
              transition: opacity 200ms linear;
            }

            .vouchify-intro__content,
            .vouchify-intro__hint {
              animation: none !important;
              opacity: 1 !important;
              transform: none !important;
              filter: none !important;
            }

            .vouchify-intro::before {
              animation: none !important;
            }
          }
        `}
      </style>

      <div className="vouchify-intro__content">
        <img
          className="vouchify-intro__image"
          src="/gpay-anime.png"
          alt=""
        />

        <div className="vouchify-intro__brand">
          <strong>Vouchify</strong>
          <span>Smart Voucher Exchange</span>
        </div>
      </div>

      <div className="vouchify-intro__hint">Tap to skip</div>
    </div>
  );
};

IntroSplash.reset = resetIntro;

export default IntroSplash;