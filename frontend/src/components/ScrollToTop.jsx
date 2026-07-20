// src/components/ScrollToTop.jsx
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { RocketLaunchIcon } from '@heroicons/react/24/solid';

function ScrollToTop() {
  const { pathname } = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [isIgniting, setIsIgniting] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // Toggle visibility based on scroll position
  useEffect(() => {
    const toggleVisibility = () => {
      // Show button if we've scrolled down and are not launching
      if (window.scrollY > 300 && !isLaunching) {
        setIsVisible(true);
      } else if (!isLaunching) {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, [isLaunching]);

  const handleLaunch = () => {
    if (isIgniting || isLaunching) return;

    // Stage 1: Ignition
    setIsIgniting(true);

    // Stage 2: Launch
    setTimeout(() => {
      setIsIgniting(false);
      setIsLaunching(true); // Rocket starts moving up

      // Visual: Start scrolling comfortably
      setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }, 200);

      // Reset
      setTimeout(() => {
        setIsLaunching(false);
      }, 1500);

    }, 600);
  };

  return (
    <>
      {/* 
         We animate the 'bottom' property directly via inline styles.
         This physically moves the fixed element up the viewport.
      */}
      <div
        className={`fixed z-50 right-8 transition-all duration-300 ease-out ${(isVisible || isLaunching) ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        style={{
          bottom: isLaunching ? '110vh' : '2rem', // Fly off screen (110vh) or stay at bottom (2rem)
          transition: isLaunching ? 'bottom 1.2s cubic-bezier(0.45, 0, 0.55, 1)' : 'opacity 0.3s ease',
        }}
      >
        <button
          onClick={handleLaunch}
          disabled={isIgniting || isLaunching}
          style={{
            transform: isIgniting ? 'scale(1.1)' : 'scale(1)',
          }}
          className={`relative group flex items-center justify-center p-4 rounded-full shadow-2xl shadow-indigo-500/40 transition-all duration-300 ${isIgniting ? 'animate-rumble bg-orange-600' : ''
            } ${isLaunching
              ? 'bg-gradient-to-t from-orange-500 via-red-600 to-rose-600'
              : 'bg-gradient-to-br from-indigo-600 to-purple-700 hover:from-indigo-500 hover:to-purple-600 hover:scale-110'
            }`}
          aria-label="Scroll to top"
        >
          {/* Exhaust Fire Animation */}
          <span
            className={`absolute -bottom-10 w-full flex justify-center transition-opacity duration-300 ${(isIgniting || isLaunching) ? 'opacity-100' : 'opacity-0'
              }`}
          >
            <span className={`relative w-3 bg-yellow-300 rounded-full blur-[2px] animate-pulse ${isLaunching ? 'h-16' : 'h-8'}`}></span>
            <span className={`absolute top-1 w-5 bg-orange-500 rounded-full blur-[4px] -z-10 animate-fire ${isLaunching ? 'h-20' : 'h-10'}`}></span>
            <span className={`absolute top-2 w-8 bg-red-600 rounded-full blur-[6px] -z-20 animate-fire-wild ${isLaunching ? 'h-24' : 'h-12'}`}></span>
          </span>

          <RocketLaunchIcon className={`h-6 w-6 text-white transition-transform duration-300 ${(!isLaunching && !isIgniting) && 'group-hover:-rotate-45'
            } ${isLaunching ? '-rotate-45' : ''}`} />
        </button>
      </div>

      {/* Custom Keyframe Styles */}
      <style>{`
        @keyframes fire {
            0% { transform: scale(1) translateY(0); opacity: 1; }
            100% { transform: scale(1.1) translateY(5px); opacity: 0.8; }
        }
        @keyframes fire-wild {
            0% { transform: scale(1) skewX(-2deg); opacity: 0.9; }
            25% { transform: scale(1.2) skewX(2deg); opacity: 0.7; }
            50% { transform: scale(0.9) skewX(-1deg); opacity: 1; }
            75% { transform: scale(1.1) skewX(1deg); opacity: 0.8; }
            100% { transform: scale(1) skewX(0); opacity: 0.9; }
        }
        @keyframes rumble {
            0% { transform: translate(1px, 1px) rotate(0deg); }
            10% { transform: translate(-1px, -2px) rotate(-1deg); }
            20% { transform: translate(-3px, 0px) rotate(1deg); }
            30% { transform: translate(3px, 2px) rotate(0deg); }
            40% { transform: translate(1px, -1px) rotate(1deg); }
            50% { transform: translate(-1px, 2px) rotate(-1deg); }
            60% { transform: translate(-3px, 1px) rotate(0deg); }
            70% { transform: translate(3px, 1px) rotate(-1deg); }
            80% { transform: translate(-1px, -1px) rotate(1deg); }
            90% { transform: translate(1px, 2px) rotate(0deg); }
            100% { transform: translate(1px, -2px) rotate(-1deg); }
        }
        .animate-fire {
            animation: fire 0.1s infinite alternate;
        }
        .animate-fire-wild {
            animation: fire-wild 0.15s infinite linear;
        }
        .animate-rumble {
            animation: rumble 0.2s linear infinite;
        }
      `}</style>
    </>
  );
}

export default ScrollToTop;