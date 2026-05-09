import React, { JSX, useRef, useState, useEffect } from "react";
import "./ArrowGrid.css";
import ArrowCell from "../Cell/ArrowCell.tsx";
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

function ArrowGrid({
  sideLength,
  game_ID,
  board,
  lostCellKey,
  gameMode,
  onUpdateBoard,
  onUpdateFlags,
  onUpdateGameState,
}: GridProps) {
  const rows: JSX.Element[] = [];

  const getCellData = (key: number) => board.find((cell) => cell.key === key);

  const ROWS = sideLength * 2; // vertical density
  const COLS = sideLength;

  const width = (100 * (2 * COLS - 1)) / (2 * COLS);
  const height = (100 * 2) / ROWS;
  const horizontalShift = (i: number) =>
    i % 2 == 0 ? 0 : width / 2 / sideLength;
  const verticalShift = (i: number) => (i == 0 ? 0 : -height / 2);

  for (let r = 0; r < ROWS; r++) {
    const rowCells: JSX.Element[] = [];
    const flip = r % 2 === 1; // alternate direction

    let count = r % 2 == 0 ? r / 2 + 1 : Math.ceil(r / 2) + sideLength;
    for (let c = 0; c < COLS; c++) {
      const cellData = getCellData(count);

      rowCells.push(
        <div className="arrow-cell-border" key={count}>
          <ArrowCell
            cellShape={"arrow"}
            gameID={game_ID}
            cellID={count}
            cellData={cellData}
            lostCellKey={lostCellKey}
            gameMode={gameMode}
            onUpdateBoard={onUpdateBoard}
            onUpdateFlags={onUpdateFlags}
            onUpdateGameState={onUpdateGameState}
            colorIndex={(r + c) % 20}
            flip={flip} // 👈 pass flip
          />
        </div>
      );
      count = count + 2 * COLS;
    }

    rows.push(
      <div
        key={r}
        className={`arrow-row ${flip ? "flip" : ""} `}
        style={{
          width: `${width}%`,
          height: `${height}%`,
          marginLeft: `${horizontalShift(r)}%`,
          marginTop: `${verticalShift(r)}%`,
        }}
      >
        {rowCells}
      </div>
    );
  }

  return <div className="arrow-grid-container">{rows}</div>;
}

export default ArrowGrid;
