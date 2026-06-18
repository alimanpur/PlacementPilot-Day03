import { createContext, useContext, useEffect, useState, useCallback } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => localStorage.getItem("pp-theme") || "system");
  const [resolved, setResolved] = useState("light");

  const apply = useCallback((t) => {
    const root = document.documentElement;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const isDark = t === "dark" || (t === "system" && mq.matches);
    root.setAttribute("data-theme", isDark ? "dark" : "light");
    setResolved(isDark ? "dark" : "light");
  }, []);

  useEffect(() => {
    apply(theme);
    localStorage.setItem("pp-theme", theme);

    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => apply("system");
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
  }, [theme, apply]);

  const setTheme = useCallback((t) => {
    setThemeState(t);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolved }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);