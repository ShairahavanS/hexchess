import React, { useState } from "react";
import "./Cell.css";
import "../CellBorder/CellBorder.css"; // Merge CSS files or keep separate
import bee from "../images/beesweeper/HexBee.svg";
import flag from "../images/beesweeper/Flag.svg";
import one from "../images/beesweeper/Number1.svg";
import two from "../images/beesweeper/Number2.svg";
import three from "../images/beesweeper/Number3.svg";
import four from "../images/beesweeper/Number4.svg";
import five from "../images/beesweeper/Number5.svg";
import six from "../images/beesweeper/Number6.svg";
import honey from "../images/beesweeper/Honey.svg";
import axios from "axios";
import { MineCellInfo } from "../Cell/MineCellInfo.tsx";
import { BACKEND_URL } from "../constants.ts";

export const api = axios.create({
  baseURL: BACKEND_URL,
});

export enum CellState {
  Unbroken = "unbroken",
  Flagged = "flagged",
  Bee = "bee",
  Empty = "empty",
  Numbered = "numbered",
  Honey = "honey",
}

interface CellProps {
  gameID: string;
  cellID: number;
  cellData?: MineCellInfo;
  onUpdateBoard?: (changedCells: MineCellInfo[]) => void;
  onUpdateFlags?: (newFlags: number) => void;
  onUpdateGameState?: (newState: string) => void;
  withBorder?: boolean;
  borderStyle?: React.CSSProperties;
}

const Cell: React.FC<CellProps> = ({
  gameID,
  cellID,
  cellData,
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
        return CellState.Bee;
      case "honey":
        return CellState.Honey;
      case "0":
        return CellState.Empty;
      default:
        return CellState.Numbered; // "1".."8"
    }
  })();

  /** Handle left click (reveal) */
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (displayState != CellState.Unbroken) return;
  
    api.post(`/beesweeper_api/${gameID}/single/`, { key: cellID })
    .then((response) => {
      onUpdateBoard?.(response.data.board); // 🔴 JUST SEND DELTAS

      if (response.data.progress) {
        onUpdateGameState?.(response.data.progress);
      }
    });
  };

  /** Handle right-click (flag) */
  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (displayState != CellState.Unbroken && displayState != CellState.Flagged) return;

    api.post(`/beesweeper_api/${gameID}/flag/`, { key: cellID })
    .then((response) => {
      onUpdateBoard?.(response.data.board);

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
    if (displayState == CellState.Unbroken) return;

    api.post(`/beesweeper_api/${gameID}/double/`, { key: cellID })
    .then((response) => {
      onUpdateBoard?.(response.data.board);
    });
  };

  /** Render image based on displayState */
  const renderImage = () => {
    if (!cellData) return null;

    switch (displayState) {
      case CellState.Honey:
        return <img className="honey" src={honey} alt="Honey" />;
      case CellState.Flagged:
        return <img className="flag" src={flag} alt="Flag" />;
      case CellState.Bee:
        return <img className="bee" src={bee} alt="Bee" />;
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
      className={`hexagon ${displayState.toLowerCase()}`}
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

export default Cell;
