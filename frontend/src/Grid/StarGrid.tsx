import React, { JSX, useRef, useState, useEffect } from "react";
import "./StarGrid.css";
import StarCell from "../Cell/StarCell.tsx";
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

function StarGrid({
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

  const width = 100.0 / (1 + 0.75 * (sideLength - 1)); // Width of Octagon
  const height = width; // This should give consistent height
  const columnHeight = (i: number) =>
    i % 2 == 0
      ? (100 *
          (2 * Math.ceil(sideLength / 2 - 1) +
            Math.floor(sideLength / 2 - 1))) /
        (2 * Math.ceil(sideLength / 2) + Math.floor(sideLength / 2))
      : 100;
  const horizontalShift = -width / 4; // Horizontal offset for centering

  const columnHeightPct = (j: number) => (100 * j) / Math.ceil(j / 2);

  // (100 / (2 * Math.ceil(sideLength / 2) + Math.floor(sideLength / 2))) *
  //   (2 * Math.ceil(sideLength / 2 - 1) + Math.floor(sideLength / 2 - 1))
  const verticalShift = (j: number, columnHeightSure: number) => {
    const starsInColumn = Math.ceil(columnHeightSure / 2);
    const K = 52.7; // geometric constant
    return -j * (K / columnHeightSure);
  };

  let count = 1; // cell ID initialization

  const getCellData = (key: number) => board.find((cell) => cell.key === key);

  // First third of the columns
  for (let i = 0; i < sideLength; i++) {
    const tempDivs: JSX.Element[] = [];
    for (let j = 0; j < sideLength - ((i + 1) % 2) * 2; j++) {
      const cellData = getCellData(count);

      tempDivs.push(
        <div
          className={
            j % 2 !== 0 ? "star-square-cell-border" : "star-cell-border"
          }
          style={{
            width: "100%",
            height: `${columnHeightPct(
              i % 2 == 0 ? sideLength - 2 : sideLength
            )}%`,
            transform: `translateY(${verticalShift(
              j,
              i % 2 == 0 ? sideLength - 2 : sideLength
            )}%)`,
          }}
        >
          <StarCell
            key={count}
            cellShape={j % 2 == 0 ? "star" : "square"}
            gameID={game_ID}
            cellID={Math.round(
              columnHeightPct(i % 2 == 0 ? sideLength - 2 : sideLength)
            )}
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
        className="star-column"
        style={{
          width: `100%`,
          height: `${columnHeight(i)}%`,
          marginLeft: `${i == 0 ? 0 : horizontalShift}%`,
        }}
      >
        {tempDivs}
      </div>
    );
  }

  return (
    <>
      <div className="star-grid-container" style={{ marginTop: "0px" }}>
        {divs}
      </div>
    </>
  );
}

export default StarGrid;
