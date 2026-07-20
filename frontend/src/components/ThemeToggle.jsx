import { useTheme } from "../Contexts/ThemeContext";
import { SunIcon, MoonIcon } from "@heroicons/react/24/solid";

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === "dark";

    return (
        <button
            onClick={toggleTheme}
            className={`
        relative inline-flex items-center h-8 w-14 rounded-full p-1
        transition-all duration-500 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent
        hover:scale-105 active:scale-95 border border-white/20 backdrop-blur-sm
        ${isDark ? "bg-slate-800/80 shadow-inner" : "bg-white/20 shadow-inner"}
      `}
            aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
            <span className="sr-only">Toggle Theme</span>

            {/* Background Icons (Decorative) */}
            <span className="absolute inset-x-0 w-full flex justify-between px-2 text-xs font-bold z-0 opacity-50">
                <span className={`${isDark ? "opacity-0" : "opacity-100"} transition-opacity duration-300 text-amber-500`}>☀</span>
                <span className={`${isDark ? "opacity-100" : "opacity-0"} transition-opacity duration-300 text-sky-200`}>☾</span>
            </span>

            {/* Sliding Knob */}
            <span
                className={`
          flex items-center justify-center h-6 w-6 rounded-full shadow-md transform transition-transform duration-500 ease-spring z-10
          ${isDark ? "translate-x-6 bg-slate-800" : "translate-x-0 bg-white"}
        `}
            >
                {isDark ? (
                    <MoonIcon className="h-4 w-4 text-brand-accent transition-transform duration-500 rotate-0" />
                ) : (
                    <SunIcon className="h-4 w-4 text-amber-500 transition-transform duration-500 rotate-0" />
                )}
            </span>
        </button>
    );
}
