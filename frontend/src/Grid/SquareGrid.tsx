import React, { JSX, useRef, useState, useEffect } from "react";
import "./SquareGrid.css";
import SquareCell from "../Cell/SquareCell.tsx";
import axios from "axios";
import { StringLiteral } from "typescript";
import { MineCellInfo } from "../Cell/MineCellInfo.tsx";

interface GridProps {
  sideLength: number;
  level: string;
  game_ID: string;
  board: MineCellInfo[];
  lostCellKey?: number | null;
  gameMode: string;
  onUpdateBoard?: (changedCells: MineCellInfo[]) => void;
  onUpdateFlags: (newFlags: number) => void;
  onUpdateGameState?: (newState: string, triggerKey?: number) => void;
}

function SquareGrid({
  sideLength,
  game_ID,
  board,
  lostCellKey,
  gameMode,
  onUpdateBoard,
  onUpdateFlags,
  onUpdateGameState,
}: GridProps) {
  const divs: JSX.Element[] = [];
  const width = 100.0 / sideLength; // Width of Octagon
  const height = width; // This should give consistent height
  const squareLength = height;

  let count = 1; // cell ID initialization

  const getCellData = (key: number) => board.find((cell) => cell.key === key);

  // First third of the columns
  for (let i = 0; i < sideLength; i += 1) {
    const tempDivs: JSX.Element[] = [];
    for (let j = 0; j < sideLength; j++) {
      const cellData = getCellData(count);

      tempDivs.push(
        <div
          className={"square-cell-border"}
          style={{
            width: "100%",
            height: `100%`,
          }}
        >
          <SquareCell
            key={count}
            cellShape={"square"}
            gameID={game_ID}
            cellID={count}
            cellData={cellData}
            lostCellKey={lostCellKey}
            gameMode={gameMode}
            onUpdateBoard={onUpdateBoard}
            onUpdateFlags={onUpdateFlags}
            onUpdateGameState={onUpdateGameState}
          />
        </div>
      );
      ++count;
    }

    divs.push(
      <div
        className="square-column"
        style={{
          width: `100%`,
          height: `100%`,
        }}
      >
        {tempDivs}
      </div>
    );
  }

  return (
    <>
      <div className="grid-container" style={{ marginTop: "0px" }}>
        {divs}
      </div>
    </>
  );
}

export default SquareGrid;
