import React, { useState, useEffect } from "react";
import "./MinesweeperInfoBoard.css";
import axios from "axios";
import flag from "../images/beesweeper/Flag.svg";
import timer from "../images/beesweeper/Timer.svg";

interface MinesweeperInfoBoardProps {
  level: string;
  setLevel: React.Dispatch<React.SetStateAction<string>>;
  flagsLeft: number;
  onReset: () => void;
  time: number;
}

const MinesweeperInfoBoard: React.FC<MinesweeperInfoBoardProps> = ({
  level,
  setLevel,
  flagsLeft,
  onReset,
  time,
}) => {
  const handleLevelChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setLevel(event.target.value);
    console.log(`Level changed to: ${event.target.value}`);
  };

  return (
    <div className="minesweeper-info-board">
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
    </div>
  );
};

export default MinesweeperInfoBoard;
