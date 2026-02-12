import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./Navbar/Navbar.tsx";
import Footer from "./Footer/Footer.tsx";
import Home from "./pages/Home.tsx";
import Beesweeper from "./pages/Beesweeper.tsx";
import Minesweeper from "./pages/Minesweeper.tsx";
import Chess from "./pages/Chess.tsx";
import Checkers from "./pages/Checkers.tsx";

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState(true);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  return (
    <Router>
      <div className={`App ${darkMode ? "dark-mode" : ""}`}>
        <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

        <div className="main-content">
          <Routes>
            <Route path="/" element={<Home darkMode={darkMode} />} />
            <Route
              path="/Beesweeper"
              element={<Beesweeper darkMode={darkMode} />}
            />
            <Route
              path="/Minesweeper"
              element={<Minesweeper darkMode={darkMode} />}
            />
            <Route path="/Chess" element={<Chess darkMode={darkMode} />} />
            <Route
              path="/Checkers"
              element={<Checkers darkMode={darkMode} />}
            />
          </Routes>
        </div>
        <Footer />
      </div>

      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <clipPath id="fishClip" clipPathUnits="objectBoundingBox">
            <path
              d="
        M  0.30 0.2125
        L 0.4875 0.00
        L 0.6625 0.2125
C 0.6625 0.4126, 0.8137 0.575, 1.00 0.575
        L 1.00 0.6625
        C 0.8137 0.6625, 0.6625 1.00, 0.6625 1.00 
        L 0.50 1.00
        L 0.325 0.80
        L 0.1375 1.00
        L 0.00 1.00
        C 0.00 0.8137, 0.146 0.6625, 0.325 0.6625
        L 0.325 0.575
A 0.487 0.487 0 0 1 0.00 0.2125


        Z
      "
            />
          </clipPath>
        </defs>
      </svg>
    </Router>
  );
};

export default App;
