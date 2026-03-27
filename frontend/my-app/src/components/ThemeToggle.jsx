import { useEffect, useState } from "react";
import { MoonFill, SunFill } from "react-bootstrap-icons";

function ThemeToggle() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <button
      className="btn btn-outline-primary btn-sm d-flex align-items-center"
      type="button"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      {theme === "light" ? <MoonFill size={16} /> : <SunFill size={16} />}
    </button>
  );
}

export default ThemeToggle;