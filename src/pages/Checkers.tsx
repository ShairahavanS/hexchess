import React from "react";
import "./Checkers.css";
import Checkerboard from "../Checkerboard/Checkerboard.tsx";
import MinesweeperInfoBoard from "../MinesweeperInfoBoard/MinesweeperInfoBoard.tsx";

interface CheckerProps {
  darkMode: boolean;
}

const Checkers: React.FC<CheckerProps> = ({ darkMode }) => {
  let sides = 6;
  let ratio = ((2 * sides - 1) / (3 * sides - 1)) * Math.sqrt(3);
  let height = 90;
  let width = height / ratio;

  return (
    <div
      className="board-complete-checkers"
      style={{
        height: `${height}vmin`,
      }}
    >
      {/* <div
        className="grid-area-checkers"
        style={{
          width: `${width}vmin`,
          height: `100%`,
        }}
      >
        <div className="checkerboard">
          <Checkerboard />
        </div>
      </div> */}
      <div>
        <h1
          style={{
            color: "white",
          }}
        >
          Checkers
        </h1>
        <p
          style={{
            color: "white",
          }}
        >
          Coming Soon...
        </p>
      </div>
    </div>
  );
};

export default Checkers;
