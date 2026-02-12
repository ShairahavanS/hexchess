import React, { JSX, useRef, useState, useEffect } from "react";
import "./FishGrid.css";
import FishCell from "../Cell/FishCell.tsx";
import axios from "axios";
import { StringLiteral } from "typescript";
import { MineCellInfo } from "../Cell/MineCellInfo.tsx";

interface FishGridProps {
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

function FishGrid({
  sideLength,
  game_ID,
  board,
  lostCellKey,
  gameMode,
  onUpdateBoard,
  onUpdateFlags,
  onUpdateGameState,
}: FishGridProps) {
  const divs: JSX.Element[] = [];
  const width = 100.0 / sideLength; // Width of Octagon
  const height = width; // This should give consistent height

  const X_OVERLAP = 0.28; // how much columns overlap
  const Y_OVERLAP = 0.45; // how much rows overlap
  const STAGGER = 0.5; // vertical stagger for odd columns

  const columnHeight = (i: number) => (100 * i) / sideLength;
  const columnHeightPct = (i: number) => 100;

  const horizontalShift = (i: number) => (i % 2 == 0 ? -width : 0);
  const verticalShift = (i: number) => -height * 0.2125 * 2;

  let count = 1; // cell ID initialization

  const getCellData = (key: number) => board.find((cell) => cell.key === key);

  const ROW_X_SHIFT = 0.5; // half a fish
  const ROW_Y_SHIFT = 0.25; // quarter of a fish

  // First third of the columns
  for (let i = 0; i < sideLength; i += 1) {
    const tempDivs: JSX.Element[] = [];
    for (let j = 0; j < sideLength; j++) {
      const cellData = getCellData(count);
      const colorIndex = (i + j) % 3; // <- alternate per fish diagonally

      const isOddRow = j % 2 === 1;

      tempDivs.push(
        <div className="fish-cell-border" key={count}>
          <FishCell
            key={count}
            cellShape={"fish"}
            gameID={game_ID}
            cellID={count}
            cellData={cellData}
            lostCellKey={lostCellKey}
            gameMode={gameMode}
            onUpdateBoard={onUpdateBoard}
            onUpdateFlags={onUpdateFlags}
            onUpdateGameState={onUpdateGameState}
            colorIndex={colorIndex}
          />
        </div>
      );

      ++count;
    }

    divs.push(
      <div
        className="fish-column"
        style={{
          width: `100%`,
          height: `100%`,
          position: "relative",
        }}
      >
        {tempDivs}
      </div>
    );
  }

  return (
    <>
      <div className="grid-container">{divs}</div>
    </>
  );
}

export default FishGrid;
