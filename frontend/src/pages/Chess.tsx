import React from "react";
import ChessBoard from "../ChessBoard/ChessBoard.tsx";

interface ChessProps {
  darkMode: boolean;
}

const Chess: React.FC<ChessProps> = ({ darkMode }) => {
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
      <div
        className="grid-area-checkers"
        style={{
          width: `${width}vmin`,
          height: `100%`,
        }}
      >
        <div className="checkerboard">
          <ChessBoard />
        </div>
      </div>
      <div>
        <h1
          style={{
            color: "white",
          }}
        >
          Chess
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

export default Chess;
