import React, { useState } from 'react';
import './Cell.css';

export enum CellState {
  Unbroken = 'unbroken',
  Flagged = 'flagged',
  Bee = 'bee',
  Empty = 'empty',
  Numbered = 'numbered'
}

interface CellProps {
  state: CellState;
}

function Cell() {
	const [cellState, setCellState] = useState(CellState.Unbroken);

	const handleClick = (e: React.MouseEvent) => {
		e.preventDefault();
		setCellState(CellState.Empty);
	};

	const handleRightClick = (e: React.MouseEvent) => {
		e.preventDefault();
		setCellState(CellState.Flagged);
	};

	return (
		<div
			className={`hexagon ${cellState}`}
			onClick={handleClick}
      onContextMenu={handleRightClick}
		/>
	);
};

export default Cell;
