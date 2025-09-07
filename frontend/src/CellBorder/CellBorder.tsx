import React from "react";
import "./CellBorder.css";
import Cell from "../Cell/Cell.tsx"; // Correct import path

interface CellBorderProps {
  style?: React.CSSProperties; // Allow inline style
}

const CellBorder: React.FC<CellBorderProps> = ({ style }) => {
  return (
    <div style={style} className="cell-border">
      <Cell></Cell>
    </div>
  );
};

export default CellBorder;
