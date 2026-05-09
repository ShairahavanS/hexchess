import React, { useState } from "react";
import "./ArrowCell.css";
import mine from "../images/minesweeper/Mine.svg";
import flag from "../images/minesweeper/Flag.svg";
import one from "../images/minesweeper/Number1.svg";
import two from "../images/minesweeper/Number2.svg";
import three from "../images/minesweeper/Number3.svg";
import four from "../images/minesweeper/Number4.svg";
import five from "../images/minesweeper/Number5.svg";
import six from "../images/minesweeper/Number6.svg";
import seven from "../images/minesweeper/Number7.svg";
import eight from "../images/minesweeper/Number8.svg";
import nine from "../images/minesweeper/Number9.svg";
import ten from "../images/minesweeper/Number10.svg";
import eleven from "../images/minesweeper/Number11.svg";
import twelve from "../images/minesweeper/Number12.svg";
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

interface ArrowCellProps {
  gameID: string;
  cellShape: string;
  cellID: number;
  cellData?: MineCellInfo;
  lostCellKey?: number | null;
  gameMode: string;
  colorIndex?: number;
  flip?: boolean;
  onUpdateBoard?: (changedCells: MineCellInfo[]) => void;
  onUpdateFlags?: (newFlags: number) => void;
  onUpdateGameState?: (state: string, triggerKey?: number) => void;
  withBorder?: boolean;
  borderStyle?: React.CSSProperties;
}

const ArrowCell: React.FC<ArrowCellProps> = ({
  gameID,
  cellShape,
  cellID,
  cellData,
  lostCellKey,
  gameMode,
  flip,
  colorIndex = 0,
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

  const COLOR_PALETTE = [
    "#ff595e",
    "#ffca3a",
    "#8ac926",
    "#1982c4",
    "#6a4c93",
    "#f72585",
    "#b5179e",
    "#7209b7",
    "#560bad",
    "#480ca8",
    "#3a0ca3",
    "#3f37c9",
    "#4361ee",
    "#4895ef",
    "#4cc9f0",
    "#ffd166",
    "#ef476f",
    "#06d6a0",
    "#118ab2",
    "#073b4c",
  ];

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
      .post(`/minesweeper_api/${gameID}/single/`, {
        key: cellID,
      })
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
      .post(`/minesweeper_api/${gameID}/flag/`, {
        key: cellID,
      })
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
      .post(`/minesweeper_api/${gameID}/double/`, {
        key: cellID,
      })
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
          case "7":
            return <img className="number" src={seven} alt="7" />;
          case "8":
            return <img className="number" src={eight} alt="8" />;
          case "9":
            return <img className="number" src={nine} alt="9" />;
          case "10":
            return <img className="number" src={ten} alt="10" />;
          case "11":
            return <img className="number" src={eleven} alt="11" />;
          case "12":
            return <img className="number" src={twelve} alt="12" />;
          default:
            return null;
        }
      case CellState.Empty:
        return <div className="empty-cell" />;
      default:
        return null;
    }
  };

  const renderCellStyles = () => {
    if (
      displayState === CellState.Unbroken ||
      displayState === CellState.Flagged
    ) {
      // Inline styles for Unbroken and Flagged states
      return {
        backgroundColor: COLOR_PALETTE[colorIndex % COLOR_PALETTE.length],
        ...(withBorder ? borderStyle : {}),
      };
    }
    // If the state isn't unbroken or flagged, let CSS handle it
    return {};
  };

  const cellElement = (
    <div
      id={`cell-${cellID}`}
      className={`
      arrow
      ${flip ? "flipped" : ""}
      ${displayState.toLowerCase()}
      ${isLosingMine ? "explode" : ""}
    `}
      style={renderCellStyles()} // Apply the styles based on state
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

export default ArrowCell;
