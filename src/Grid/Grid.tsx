import React, { JSX } from 'react';
import './Grid.css';
import Cell from '../Cell/Cell.tsx';
import CellBorder from '../CellBorder/CellBorder.tsx'


function Grid() {
  const sideLength = 6;
  const divs: JSX.Element[] = [];

  let shift = 152.9;

  // First half of the columns
  for (let i = sideLength; i < 2*(sideLength); i++) {
    const tempDivs: JSX.Element[] = [];
    shift -= 21.7
    for (let j = 0; j < i; j++) {
      tempDivs.push(
        <div key={`cell-${i}-${j}`} className="hex-grid">
          <CellBorder/>
          <Cell />
        </div>
      );
    }

    divs.push(
      <div key={`row-${i}`} style={{ marginTop: `${shift}px`, marginLeft: `0px` }}>
        {tempDivs}
        <h1>yo</h1>
      </div>
    );
  }

  // Second half of the columns
  for (let i = 2*sideLength-2; i >= sideLength; i--) {
    const tempDivs: JSX.Element[] = [];
    shift += 21.7;
    for (let j = 0; j < i; j++) {
      tempDivs.push(
        <div key={`cell-${i}-${j}`} className="hex-grid" >
          <CellBorder/>
          <Cell/>
        </div>
      );
    }

    divs.push(
      <div key={`row-${i}`} style={{ marginTop: `${shift}px`, marginLeft: `0px` }}>
        {tempDivs}
        <h1>yo</h1>
      </div>
    );
  }

  return (
    <div className="grid-container">
      <div className="grid-container">
        {divs}
      </div>
    </div>
  );
};

export default Grid;
