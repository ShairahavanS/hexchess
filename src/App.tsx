import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./Navbar/Navbar.tsx";
import Footer from "./Footer/Footer.tsx";
import Home from "./pages/Home.tsx";
import Beesweeper from "./pages/Beesweeper.tsx";
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
            <Route path="/Beesweeper" element={<Beesweeper darkMode={darkMode} />} />
            <Route path="/Chess" element={<Chess darkMode={darkMode} />} />
            <Route path="/Checkers" element={<Checkers darkMode={darkMode} />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
