import { useState, useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import colors from "./styles/colors";

const App = () => {
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  const toggleTheme = () => {
    setIsDarkTheme((prev) => !prev);
  };

  // Load saved theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("appTheme");
    if (savedTheme === "dark") setIsDarkTheme(true);
  }, []);

  // Apply theme
  useEffect(() => {
    localStorage.setItem("appTheme", isDarkTheme ? "dark" : "light");
    document.body.style.backgroundColor = isDarkTheme
      ? colors.darkBg
      : colors.background;
    document.body.style.color = isDarkTheme
      ? colors.textLight
      : colors.textMain;
  }, [isDarkTheme]);

  return (
    <BrowserRouter>
      <AppRoutes isDarkTheme={isDarkTheme} toggleTheme={toggleTheme} />

      {/* 🔥 ONE global ToastContainer for ENTIRE APP */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />
    </BrowserRouter>
  );
};

export default App;
