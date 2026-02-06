import React from "react";
import "./BeesweeperInfoBoard.css";
import flag from "../images/beesweeper/Flag.svg";
import timer from "../images/beesweeper/Timer.svg";

interface BeesweeperInfoBoardProps {
  level: string;
  setLevel: React.Dispatch<React.SetStateAction<string>>;
  flagsLeft: number;
  onReset: () => void;
  time: number;
  gameState: string;
}

const BeesweeperInfoBoard: React.FC<BeesweeperInfoBoardProps> = ({
  level,
  setLevel,
  flagsLeft,
  onReset,
  time,
  gameState,
}) => {
  return (
    <div className="hex-info-board">
      <div className="hex-info-content">
        <div className="hex-info-item">
          <img src={flag} alt="Flags" className="icon" />
          <h3>{flagsLeft}</h3>
        </div>

        <div
          className={`hex-info-item timer ${
            gameState === "IP" ? "running" : ""
          }`}
        >
          <img src={timer} alt="Timer Icon" className="icon" />
          <h3>{time}</h3>
        </div>

        <button className="reset-button" onClick={onReset}>
          Reset
        </button>

        <div className="hex-level-row">
          <label>Level</label>
          <select value={level} onChange={(e) => setLevel(e.target.value)}>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
            <option value="Extreme">Extreme</option>
            <option value="Impossible">Impossible</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default BeesweeperInfoBoard;
