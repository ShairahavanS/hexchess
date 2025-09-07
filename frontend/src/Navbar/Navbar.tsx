import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../images/webdesign/HexChessLogo.svg";
import checkerPiece from "../images/checkerPieces/Red Checker Piece.svg";
import chessPiece from "../images/chessPieces/Chess_rdt45.svg";
import bee from "../images/beesweeper/Hex Bee.svg";
import settings from "../images/webdesign/Settings.svg";
import howToPlay from "../images/webdesign/How to Play.svg";
import gifTest from "../images/webdesign/MJ-giphy.gif";
import step1 from "../images/webdesign/Step 1.mp4";
import step2 from "../images/webdesign/Step 2.mp4";
import step3 from "../images/webdesign/Step 3.mp4";
import step4 from "../images/webdesign/Step 4.mp4";
import "./Navbar.css";
import Modal from "./Modal.tsx";

interface HowToPlayStep {
  caption: string;
  video: string; 
}

const beesweeperSteps: HowToPlayStep[] = [
  {
    video: step1,
    caption:
      "Click all cells that are not occupied by a bee. Numbers indicate adjacent bees.",
  },
  {
    video: step2,
    caption: "Right-click to flag cells containing bees to avoid them.",
  },
  {
    video: step3,
    caption:
      "Double-click or scroll wheel on numbered cells with correct adjacent flags to free surrounding cells.",
  },
  {
    video: step4,
    caption: "Free all the cells to harvest the honeycomb!",
  },
];

const chessSteps: HowToPlayStep[] = [
  {
    video: "/gifs/move-piece.mp4",
    caption: "Move pieces according to standard chess rules.",
  },
  {
    video: "/gifs/checkmate.mp4",
    caption: "Checkmate your opponent's king to win.",
  },
];

const checkersSteps: HowToPlayStep[] = [
  {
    video: "/gifs/move-diagonal.mp4",
    caption: "Move pieces diagonally.",
  },
  {
    video: "/gifs/jump-capture.mp4",
    caption: "Jump over opponent pieces to capture them.",
  },
  {
    video: "/gifs/king-piece.mp4",
    caption: "Reach the opposite side to king your piece.",
  },
];

const stepsByPage: { [key: string]: HowToPlayStep[] } = {
  "/Beesweeper": beesweeperSteps,
  "/Chess": chessSteps,
  "/Checkers": checkersSteps,
};

const howToPlayContent: { [key: string]: React.ReactNode } = {
  "/Beesweeper": (
    <div>
      <p>Avoid the bees and harvest honey!</p>
      <p>
        Click all cells that are not occupied by a bee. The number indicates how
        many adjacent cells contain a bee.
      </p>
      <p>
        Right-click to flag cells containing bees. Though not mandatory, it
        helps you avoid clicking these cells.
      </p>
      <p>
        Double-click (left + right click) or scroll wheel on numbered cells with
        the right number of adjacent flags to free unflagged adjacent cells.
      </p>
      <p>Free all the cells and harvest the honeycomb!</p>
    </div>
  ),
  "/Chess": (
    <div>
      <p>Classic chess rules apply.</p>
      <p>Each type of piece moves according to standard chess rules.</p>
      <p>Checkmate your opponent's king to win.</p>
    </div>
  ),
  "/Checkers": (
    <div>
      <p>Move your pieces diagonally.</p>
      <p>Jump over opponent pieces to capture them.</p>
      <p>Reach the opposite side to king your piece.</p>
      <p>Capture all opponent pieces to win.</p>
    </div>
  ),
};

const HowToPlayModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>How to Play</h2>
        <button className="close-modal" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

interface NavbarProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ darkMode, toggleDarkMode }) => {
  const location = useLocation();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isHowToPlayModalOpen, setIsHowToPlayModalOpen] = useState(false);

  const openSettingsModal = () => setIsSettingsModalOpen(true);
  const closeSettingsModal = () => setIsSettingsModalOpen(false);

  const openHowToPlayModal = () => setIsHowToPlayModalOpen(true);
  const closeHowToPlayModal = () => setIsHowToPlayModalOpen(false);

  const pageImages: { [key: string]: string } = {
    "/Beesweeper": bee,
    "/Chess": chessPiece,
    "/Checkers": checkerPiece,
  };

  const currentImage = pageImages[location.pathname];

  const handleHowToPlayClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="logo-container">
        <Link to="/" className="logo-link">
          <img className="mainLogo" src={logo} alt="Logo" />
        </Link>
        {currentImage && (
          <img
            className="currentGame"
            src={currentImage}
            alt="Current Game"
            height="80px"
            style={{ borderRadius: "10px" }}
          />
        )}
      </div>

      <div className="navbar-links-container">
        <ul className="navbar-links">
          <li
            className={`navbar-item ${
              location.pathname === "/Beesweeper" ? "active" : ""
            }`}
          >
            <Link to="/Beesweeper" style={{}}>
              Beesweeper
            </Link>
          </li>
          <li
            className={`navbar-item ${
              location.pathname === "/Chess" ? "active" : ""
            }`}
          >
            <Link to="/Chess">Chess</Link>
          </li>
          <li
            className={`navbar-item ${
              location.pathname === "/Checkers" ? "active" : ""
            }`}
          >
            <Link to="/Checkers">Checkers</Link>
          </li>
        </ul>

        <button onClick={openHowToPlayModal} className="how-to-play-button">
          <img src={howToPlay} alt="How to Play"></img>
        </button>

        <button onClick={openSettingsModal} className="settings-button">
          <img src={settings} alt="Settings"></img>
        </button>

        {/* Settings Modal */}
        <Modal
          isOpen={isSettingsModalOpen}
          onClose={closeSettingsModal}
          title="Settings"
          content={
            <div className="settings-content">
              <div className="dark-mode-row">
                <span>Dark Mode</span>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={darkMode}
                    onChange={toggleDarkMode}
                  />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>
          }
        />

        {/* How to Play Modal */}
        <Modal
          className="how-to-play-modal" 
          isOpen={isHowToPlayModalOpen}
          onClose={closeHowToPlayModal}
          title="How to Play"
          content={
            <div className="how-to-play-content-horizontal">
              {(stepsByPage[location.pathname] || []).map((step, index) => (
                <div key={index} className="how-to-play-step-horizontal">
                  <video
                    src={step.video}
                    className="how-to-play-gif"
                    autoPlay
                    loop
                    muted
                    playsInline
                  />
                  <p className="how-to-play-caption">{step.caption}</p>
                </div>
              ))}
            </div>
          }
        />
      </div>
    </nav>
  );
};

export default Navbar;
