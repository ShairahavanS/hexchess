import React, { JSX, useRef, useState, useEffect } from "react";
import "./Grid.css";
import Cell from "../Cell/Cell.tsx";
import axios from "axios";
import { StringLiteral } from "typescript";
import { MineCellInfo } from "../Cell/MineCellInfo.tsx";

interface GridProps {
  sideLength: number;
  level: string;
  game_ID: string;
  board: MineCellInfo[];
  onUpdateBoard?: (changedCells: MineCellInfo[]) => void;
  onUpdateFlags: (newFlags: number) => void;
  onUpdateGameState?: (newState: string) => void;
}

function Grid({
  sideLength,
  game_ID,
  board,
  onUpdateBoard,
  onUpdateFlags,
  onUpdateGameState,
}: GridProps) {
  const divs: JSX.Element[] = [];
  const width = (2 * 100.0) / (3 * sideLength - 1); // This should give consistent width
  const height = 100.0 / (2 * sideLength - 1); // This should give consistent height

  // const shiftUpdate = 0;
  // let shift = 0; // Start shift at 0 and update in the loop if needed
  const horizontalShift = -width / 4.0; // Horizontal offset for centering
  let count = 1; // cell ID initialization

  const getCellData = (key: number) => board.find((cell) => cell.key === key);

  // First half of the columns
  for (let i = sideLength; i < 2 * sideLength; i++) {
    const tempDivs: JSX.Element[] = [];
    // shift -= shiftUpdate; // Adjust vertical position (if needed, can be simplified)
    for (let j = 0; j < i; j++) {
      const cellData = getCellData(count);
      tempDivs.push(
        <div
          className="cell-border"
          style={{
            // width: `${width}%`,
            // height: `${height}%`,
            // width: `${100 + ((2 * sideLength - 2) * width) / 4}%`,
            width: "100%",
            height: `100%`,
          }}
        >
          <Cell
            key={count}
            gameID={game_ID}
            cellID={count}
            cellData={cellData}
            onUpdateBoard={onUpdateBoard}
            onUpdateFlags={onUpdateFlags}
            onUpdateGameState={onUpdateGameState}
          />
          {/* <h1 style={{ color: "red" }}>{cellData?.revealed ? 1 : 0}</h1> */}
        </div>
      );
      ++count;
    }

    divs.push(
      <div
        className="hex-column"
        style={{
          width: `100%`,
          height: `${i * height}%`,
          marginTop: `0%`,
          // marginLeft: `0%`,
          marginLeft: `${i == sideLength ? 0 : horizontalShift}%`,
        }}
      >
        {tempDivs}
      </div>
    );
  }

  // Second half of the columns
  for (let i = 2 * sideLength - 2; i >= sideLength; i--) {
    const tempDivs: JSX.Element[] = [];
    // shift -= shiftUpdate; // Adjust vertical position (if needed, can be simplified)
    for (let j = 0; j < i; j++) {
      const cellData = getCellData(count);
      tempDivs.push(
        <div
          className="cell-border"
          style={{
            // width: `${width}%`,
            // height: `${height}%`,
            // width: `${(100 * (2 * sideLength)) / (2 * sideLength - 1)}%`,
            width: "100%",
            height: `100%`,
          }}
        >
          <Cell
            key={count}
            gameID={game_ID}
            cellID={count}
            cellData={cellData}
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
        className="hex-column"
        style={{
          width: `100%`,
          height: `${i * height}%`,
          marginTop: `0%`,
          marginLeft: `${horizontalShift}%`,
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

export default Grid;
