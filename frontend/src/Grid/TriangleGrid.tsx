import React, { JSX, useRef, useState, useEffect } from "react";
import "./TriangleGrid.css";
import TriangleCell from "../Cell/TriangleCell.tsx";
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

function TriangleGrid({
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
  const width = 100 / sideLength; // % of grid width
  const height = (width * Math.sqrt(3)) / 2; // triangle height ratio

  const columnHeight = (i: number) => (100 * i) / sideLength;
  const columnHeightPct = (i: number) => 100;

  const horizontalShift = -width / 2;

  let count = 0; // cell ID initialization
  let countUpper = 0;

  const getCellData = (key: number) => board.find((cell) => cell.key === key);

  // First half of the columns
  for (let i = 1; i <= sideLength; i += 1) {
    const tempDivs: JSX.Element[] = [];
    count = countUpper + i;

    for (let j = 0; j < i; j++) {
      const cellData = getCellData(count);

      tempDivs.push(
        <div
          className={
            j % 2 == 0 ? "triangle-up-cell-border" : "triangle-down-cell-border"
          }
          style={{
            width: `100%`,
            height: `${columnHeightPct(i)}%`,
          }}
        >
          <TriangleCell
            key={count}
            cellShape={j % 2 == 0 ? "triangle-up" : "triangle-down"}
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
      ++countUpper;
      --count;
    }

    divs.push(
      <div
        className="triangle-column"
        style={{
          width: `100%`,
          height: `${columnHeight(i)}%`,
          marginLeft: `${i == 1 ? 0 : horizontalShift}%`,
        }}
      >
        {tempDivs}
      </div>
    );
  }

  count = countUpper;

  // First half of the columns
  for (let i = sideLength - 1; i > 0; i -= 1) {
    count = countUpper + i;
    const tempDivs: JSX.Element[] = [];
    for (let j = 0; j < i; j++) {
      const cellData = getCellData(count);

      tempDivs.push(
        <div
          className={
            j % 2 == 0 ? "triangle-up-cell-border" : "triangle-down-cell-border"
          }
          style={{
            width: `100%`,
            height: `${columnHeightPct(i)}%`,
          }}
        >
          <TriangleCell
            key={count}
            cellShape={j % 2 == 0 ? "triangle-up" : "triangle-down"}
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
      --count;
      ++countUpper;
    }

    divs.push(
      <div
        className="triangle-column"
        style={{
          width: `100%`,
          height: `${columnHeight(i)}%`,
          marginLeft: `${horizontalShift}%`,
        }}
      >
        {tempDivs}
      </div>
    );
  }

  return (
    <>
      <div className="triangle-grid-container" style={{ marginTop: "0px" }}>
        {divs}
      </div>
    </>
  );
}

export default TriangleGrid;
