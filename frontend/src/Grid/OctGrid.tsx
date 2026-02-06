import React, { JSX, useRef, useState, useEffect } from "react";
import "./OctGrid.css";
import OctCell from "../Cell/OctCell.tsx";
import axios from "axios";
import { StringLiteral } from "typescript";
import { MineCellInfo } from "../Cell/MineCellInfo.tsx";

interface GridProps {
  sideLength: number;
  level: string;
  game_ID: string;
  board: MineCellInfo[];
  lostCellKey?: number | null;
  onUpdateBoard?: (changedCells: MineCellInfo[]) => void;
  onUpdateFlags: (newFlags: number) => void;
  onUpdateGameState?: (newState: string, triggerKey?: number) => void;
}

function OctGrid({
  sideLength,
  game_ID,
  board,
  lostCellKey,
  onUpdateBoard,
  onUpdateFlags,
  onUpdateGameState,
}: GridProps) {
  const divs: JSX.Element[] = [];
  const width =
    ((1 + Math.sqrt(2)) * 100.0) /
    (2 * sideLength - 1 + Math.sqrt(2) * sideLength); // Width of Octagon
  const height = width; // This should give consistent height
  const squareLength = height / (1 + Math.sqrt(2));
  const columnHeight = (i: number) =>
    i * squareLength + Math.ceil(i / 2) * Math.sqrt(2) * squareLength;
  const horizontalShift = -width / Math.sqrt(2) / (1 + Math.sqrt(2)); // Horizontal offset for centering

  const columnHeightPct = (i: number) =>
    100 *
    ((i * (1 + Math.sqrt(2))) /
      (Math.ceil(i / 2) * (1 + Math.sqrt(2)) + Math.floor(i / 2)));

  const verticalShift = (j: number, i: number) =>
    ((-j / i) * 50 * Math.sqrt(2)) / (1 + Math.sqrt(2));

  let count = 1; // cell ID initialization

  const getCellData = (key: number) => board.find((cell) => cell.key === key);

  // First third of the columns
  for (let i = sideLength; i < 2 * sideLength; i += 2) {
    const tempDivs: JSX.Element[] = [];
    for (let j = 0; j < i; j++) {
      const cellData = getCellData(count);

      tempDivs.push(
        <div
          className={j % 2 !== 0 ? "oct-square-cell-border" : "oct-cell-border"}
          style={{
            width: "100%",
            height: `${columnHeightPct(i)}%`,
            transform: `translateY(${verticalShift(j, i)}%)`,
          }}
        >
          <OctCell
            key={count}
            cellShape={j % 2 == 0 ? "octagon" : "square"}
            gameID={game_ID}
            cellID={count}
            cellData={cellData}
            lostCellKey={lostCellKey}
            onUpdateBoard={onUpdateBoard}
            onUpdateFlags={onUpdateFlags}
            onUpdateGameState={onUpdateGameState}
          />
          {/* <h1 style={{ color: "red" }}>{count}</h1> */}
        </div>
      );
      ++count;
    }

    divs.push(
      <div
        className="oct-column"
        style={{
          width: `100%`,
          height: `${columnHeight(i)}%`,
          marginLeft: `${i == sideLength ? 0 : horizontalShift}%`,
        }}
      >
        {tempDivs}
      </div>
    );
  }

  // Middle columns
  for (let i = 0; i < sideLength - 2; i++) {
    const tempDivs: JSX.Element[] = [];
    for (let j = 0; j < 2 * sideLength - 1; j++) {
      const cellData = getCellData(count);
      tempDivs.push(
        <div
          className={
            (i + j) % 2 == 0 ? "oct-square-cell-border" : "oct-cell-border"
          }
          style={{
            width: "100%",
            height: `${columnHeightPct(2 * sideLength - 1)}%`,
            transform: `translateY(${verticalShift(j, 2 * sideLength - 1)}%)`,
          }}
        >
          <OctCell
            key={count}
            cellShape={(i + j) % 2 !== 0 ? "octagon" : "square"}
            gameID={game_ID}
            cellID={count}
            cellData={cellData}
            lostCellKey={lostCellKey}
            onUpdateBoard={onUpdateBoard}
            onUpdateFlags={onUpdateFlags}
            onUpdateGameState={onUpdateGameState}
          />
          {/* <h1 style={{ color: "red" }}>{count}</h1> */}
        </div>
      );
      ++count;
    }

    divs.push(
      <div
        className="oct-column"
        style={{
          width: `100%`,
          height: `${columnHeight(2 * sideLength - 1)}%`,
          // height: `${
          //   i * squareLength + Math.ceil(i / 2) * Math.sqrt(2) * squareLength
          // }%`,
          marginLeft: `${horizontalShift}%`,
        }}
      >
        {tempDivs}
      </div>
    );
  }

  // Last third of columns
  for (let i = 2 * sideLength - 1; i >= sideLength; i -= 2) {
    const tempDivs: JSX.Element[] = [];
    for (let j = 0; j < i; j++) {
      const cellData = getCellData(count);

      tempDivs.push(
        <div
          className={j % 2 !== 0 ? "oct-square-cell-border" : "oct-cell-border"}
          style={{
            width: "100%",
            height: `${columnHeightPct(i)}%`,
            transform: `translateY(${verticalShift(j, i)}%)`,
          }}
        >
          <OctCell
            key={count}
            cellShape={j % 2 == 0 ? "octagon" : "square"}
            gameID={game_ID}
            cellID={count}
            cellData={cellData}
            lostCellKey={lostCellKey}
            onUpdateBoard={onUpdateBoard}
            onUpdateFlags={onUpdateFlags}
            onUpdateGameState={onUpdateGameState}
          />
          {/* <h1 style={{ color: "red" }}>{count}</h1> */}
        </div>
      );
      ++count;
    }

    divs.push(
      <div
        className="oct-column"
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
      <div className="grid-container" style={{ marginTop: "0px" }}>
        {divs}
      </div>
    </>
  );
}

export default OctGrid;
