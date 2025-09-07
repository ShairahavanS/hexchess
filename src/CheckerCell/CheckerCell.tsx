import React, { useState } from "react";
import "./CheckerCell.css";
import { CellState } from "../Cell/Cell";
import { relative } from "path";
import checkerPiece from "../images/checkerPieces/King Black Checker Piece.svg";

export enum CheckerCellState {
  Unclicked = "clicked",
  RightClicked = "rightClicked",
  MoveOption = "moveOption",
  MoveCapture = "moveCapture",
  Clicked = "clicked",
  Colour = "black",
  Bee = "bee",
  Empty = "empty",
  Numbered = "numbered",
}

interface CheckerCellProps {
  state?: CheckerCellState;
  cellID: number;
  cellColour: number;
}

function CheckerCell({
  state = CheckerCellState.Unclicked,
  cellID,
  cellColour,
}: CheckerCellProps) {
  const [checkerCellState, setCellState] = useState(CheckerCellState.Unclicked);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (checkerCellState == CheckerCellState.Clicked) {
      setCellState(CheckerCellState.Unclicked);
    } else {
      setCellState(CheckerCellState.Clicked);
    }
  };

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setCellState(CheckerCellState.RightClicked);
  };

  return (
    <div
      className={`checkerHexagon 
      ${checkerCellState} 
      ${cellColour === 0 ? "color0" : cellColour === 1 ? "color1" : "color2"}`}
      onClick={handleClick}
      onContextMenu={handleRightClick}
    >
      {/* <p>{cellID}</p> */}
      <img className="checkerPiece" src={checkerPiece}></img>
    </div>
  );
}

export default CheckerCell;
