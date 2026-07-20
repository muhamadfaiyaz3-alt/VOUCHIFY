
import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export function useTheme() {
    return useContext(ThemeContext);
}

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => {
        // Check localStorage first
        if (typeof window !== "undefined") {
            const savedTheme = localStorage.getItem("theme");
            if (savedTheme) {
                return savedTheme;
            }
            // If no saved preference, respect OS preference
            if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
                return "dark";
            }
        }
        return "light"; // Default to light
    });

    useEffect(() => {
        const root = document.documentElement;
        // Remove both to ensure clean state before adding current
        root.classList.remove("light", "dark");
        root.classList.add(theme);
        localStorage.setItem("theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
    };

    const setDark = () => setTheme("dark");
    const setLight = () => setTheme("light");

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setDark, setLight }}>
            {children}
        </ThemeContext.Provider>
    );
}
