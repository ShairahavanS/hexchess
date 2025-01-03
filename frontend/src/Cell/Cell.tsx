import React, { useState } from 'react';
import './Cell.css';
import axios from 'axios';
axios.defaults.xsrfHeaderName = "X-CSRFTOKEN";
axios.defaults.xsrfCookieName = "csrftoken";

export enum CellState {
  Unbroken = 'unbroken',
  Flagged = 'flagged',
  Bee = 'bee',
  Empty = 'empty',
  Numbered = 'numbered'
}

interface CellProps {
	row: number;
	col: number;
  // state?: CellState;
}

function Cell(props: CellProps) {
	let cell = { row: props.row, col: props.col, revealed: false, flagged: false };
	const [cellState, setCellState] = useState(CellState.Unbroken);

	const getCellData = () => {
		axios
			.get('/api/cells/1')
			.then((response) => {
				// console.log(response.data);
				if (response.data.flagged) {
					setCellState(CellState.Flagged);
				} else if (response.data.revealed) {
					setCellState(CellState.Empty);
				}
			})
			.catch((err) => console.log(err));
	};

	getCellData();

	const handleClick = (e: React.MouseEvent) => {
		e.preventDefault();
		cell.revealed = true;
		console.log("Cell");
		console.log(cell);
		axios
			.post(`/api/cells/1`, cell)
			.then((response) => {
				console.log(response.data);
				getCellData();
			})
			.catch((err) => console.log(err));
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
