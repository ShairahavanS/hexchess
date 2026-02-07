import React, { useState, useEffect } from "react";
import "./MinesweeperInfoBoard.css";
import axios from "axios";
import flag from "../images/beesweeper/Flag.svg";
import timer from "../images/beesweeper/Timer.svg";

interface MinesweeperInfoBoardProps {
  level: string;
  setLevel: React.Dispatch<React.SetStateAction<string>>;
  gameMode: string;
  setGameMode: React.Dispatch<React.SetStateAction<string>>;
  flagsLeft: number;
  onReset: () => void;
  time: number;
  darkMode: boolean;
}

const MinesweeperInfoBoard: React.FC<MinesweeperInfoBoardProps> = ({
  level,
  setLevel,
  gameMode,
  setGameMode,
  flagsLeft,
  onReset,
  time,
  darkMode,
}) => {
  const handleLevelChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setLevel(event.target.value);
    console.log(`Level changed to: ${event.target.value}`);
  };

  const handleGameModeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setGameMode(event.target.value);
    console.log(`Game mode changed to: ${event.target.value}`);
  };

  return (
    <div className={`minesweeper-info-board ${darkMode ? "dark" : "light"}`}>
      <div className="info-item">
        <img src={flag} alt="Flag Icon" className="icon" />
        <h3>{flagsLeft}</h3>
      </div>

      <div className="info-item">
        <img src={timer} alt="Timer Icon" className="icon" />
        <h3>{time}</h3>
      </div>

      <div className="info-item">
        <button onClick={onReset} className="reset-button">
          Reset
        </button>
      </div>

      <div className="info-item level-row">
        <label htmlFor="level-select">Level: </label>
        <select
          id="level-select"
          value={level}
          onChange={handleLevelChange}
          className="level-selector"
        >
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
          <option value="Extreme">Extreme</option>
          <option value="Impossible">Impossible</option>
        </select>
      </div>

      <div className="info-item game-mode-row">
        <label htmlFor="game-mode-select">Game Mode: </label>
        <select
          id="game-mode-select"
          value={gameMode}
          onChange={handleGameModeChange}
          className="game-mode-selector"
        >
          <option value="Square">Square</option>
          <option value="Octagon-Square">Octagon-Square</option>
          <option value="Triangle">Triangle</option>
          <option value="Square-Triangle">Square-Triangle</option>
          <option value="Hexagon-Square-Triangle">
            Hexagon-Square-Triangle
          </option>
        </select>
      </div>
    </div>
  );
};

export default MinesweeperInfoBoard;
