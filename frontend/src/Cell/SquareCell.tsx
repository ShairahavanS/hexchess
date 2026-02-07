import React, { useState } from "react";
import "./SquareCell.css";
import mine from "../images/minesweeper/Mine.svg";
import flag from "../images/minesweeper/Flag.svg";
import one from "../images/minesweeper/Number1.svg";
import two from "../images/minesweeper/Number2.svg";
import three from "../images/minesweeper/Number3.svg";
import four from "../images/minesweeper/Number4.svg";
import five from "../images/minesweeper/Number5.svg";
import six from "../images/minesweeper/Number6.svg";
import trophy from "../images/minesweeper/Trophy.svg";
import axios from "axios";
import { MineCellInfo } from "./MineCellInfo.tsx";
import { BACKEND_URL } from "../constants.ts";

export const api = axios.create({
  baseURL: BACKEND_URL,
});

export enum CellState {
  Unbroken = "unbroken",
  Flagged = "flagged",
  Mine = "mine",
  Empty = "empty",
  Numbered = "numbered",
  Trophy = "trophy",
}

interface SquareCellProps {
  gameID: string;
  cellShape: string;
  cellID: number;
  cellData?: MineCellInfo;
  lostCellKey?: number | null;
  gameMode: string;
  onUpdateBoard?: (changedCells: MineCellInfo[]) => void;
  onUpdateFlags?: (newFlags: number) => void;
  onUpdateGameState?: (state: string, triggerKey?: number) => void;
  withBorder?: boolean;
  borderStyle?: React.CSSProperties;
}

const SquareCell: React.FC<SquareCellProps> = ({
  gameID,
  cellShape,
  cellID,
  cellData,
  lostCellKey,
  gameMode,
  onUpdateBoard,
  onUpdateFlags,
  onUpdateGameState,
  withBorder = false,
  borderStyle,
}) => {
  const [mouseButtons, setMouseButtons] = useState({
    left: false,
    right: false,
  });

  const displayState = (() => {
    if (!cellData) return CellState.Unbroken;

    switch (cellData.kind) {
      case "hidden":
        return CellState.Unbroken;
      case "flag":
        return CellState.Flagged;
      case "mine":
        return CellState.Mine;
      case "trophy":
        return CellState.Trophy;
      case "0":
        return CellState.Empty;
      default:
        return CellState.Numbered; // "1".."8"
    }
  })();

  const isLosingMine = cellData?.kind === "mine" && lostCellKey === cellID;

  /** Handle left click (reveal) */
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (displayState != CellState.Unbroken) return;

    api
      .post(`/minesweeper_api/${gameID}/single/`, { key: cellID })
      .then((response) => {
        onUpdateBoard?.(response.data.board); // 🔴 JUST SEND DELTAS

        if (response.data.progress) {
          onUpdateGameState?.(response.data.progress, cellID);
        }
        if (response.data.flags !== undefined) {
          onUpdateFlags?.(response.data.flags);
        }
      });
  };

  /** Handle right-click (flag) */
  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (displayState != CellState.Unbroken && displayState != CellState.Flagged)
      return;

    api
      .post(`/minesweeper_api/${gameID}/flag/`, { key: cellID })
      .then((response) => {
        onUpdateBoard?.(response.data.board);

        if (response.data.progress) {
          onUpdateGameState?.(response.data.progress, cellID);
        }
        if (response.data.flags !== undefined) {
          onUpdateFlags?.(response.data.flags);
        }
      });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();

    if (e.button === 0) setMouseButtons((prev) => ({ ...prev, left: true }));
    if (e.button === 2) setMouseButtons((prev) => ({ ...prev, right: true }));

    if (e.button === 1) triggerDoubleClickAction();
    if ((e.buttons & 3) === 3) triggerDoubleClickAction();
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (e.button === 0) setMouseButtons((prev) => ({ ...prev, left: false }));
    if (e.button === 2) setMouseButtons((prev) => ({ ...prev, right: false }));
  };

  const triggerDoubleClickAction = () => {
    if (displayState === CellState.Unbroken) return;

    api
      .post(`/minesweeper_api/${gameID}/double/`, { key: cellID })
      .then((response) => {
        onUpdateBoard?.(response.data.board);

        if (response.data.progress) {
          onUpdateGameState?.(response.data.progress, cellID);
        }
        if (response.data.flags !== undefined) {
          onUpdateFlags?.(response.data.flags);
        }
      });
  };

  /** Render image based on displayState */
  const renderImage = () => {
    if (!cellData) return null;

    switch (displayState) {
      case CellState.Trophy:
        return <img className="trophy" src={trophy} alt="Trophy" />;
      case CellState.Flagged:
        return <img className="flag" src={flag} alt="Flag" />;
      case CellState.Mine:
        return <img className="mine" src={mine} alt="mine" />;
      case CellState.Numbered:
        switch (cellData.kind) {
          case "1":
            return <img className="number" src={one} alt="1" />;
          case "2":
            return <img className="number" src={two} alt="2" />;
          case "3":
            return <img className="number" src={three} alt="3" />;
          case "4":
            return <img className="number" src={four} alt="4" />;
          case "5":
            return <img className="number" src={five} alt="5" />;
          case "6":
            return <img className="number" src={six} alt="6" />;
          default:
            return null;
        }
      case CellState.Empty:
        return <div className="empty-cell" />;
      default:
        return null;
    }
  };

  const cellElement = (
    <div
      id={`cell-${cellID}`}
      className={`
      square
      ${displayState.toLowerCase()}
      ${isLosingMine ? "explode" : ""}
    `}
      style={withBorder ? borderStyle : {}}
      onClick={handleClick}
      onContextMenu={handleRightClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      {renderImage()}
    </div>
  );

  return cellElement;
};

export default SquareCell;
