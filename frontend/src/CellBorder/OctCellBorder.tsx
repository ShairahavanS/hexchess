import React from "react";
import "./OctCellBorder.css";
import OctCell from "../Cell/OctCell.tsx"; // Correct import path

interface CellBorderProps {
  style?: React.CSSProperties; // Allow inline style
}

const CellBorder: React.FC<CellBorderProps> = ({ style }) => {
  return (
    <div style={style} className="cell-border">
      <OctCell></OctCell>
    </div>
  );
};

export default CellBorder;
