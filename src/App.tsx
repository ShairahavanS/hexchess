import React from "react";
// import logo from "./HexChessLogo.svg";
import "./App.css";
import Grid from "./Grid/Grid.tsx";
import Navbar from "./navbar/Navbar.tsx";
import { relative } from "path";
// import { Link } from "react-router-dom";

function App() {
  let sides = 100;
  /** smallSidelength = x, width = smallSideLength * (4*sides-1) = 500 height =  (2*sides - 1) * smallSideLength * */
  let width = 800;
  let smallSideLength = width / (3 * sides - 1);
  let height = (2 * sides - 1) * smallSideLength * Math.sqrt(3);

  return (
    <div className="App">
      {/* <link rel="icon" href="./HexChessLogo.svg" />

      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header> */}
      <Navbar />
      <div
        style={{
          // width: `500px`,
          // height: `550px`,
          width: `${width}px`,
          height: `${height}px`,
          backgroundColor: "red",
          position: "relative",
        }}
      >
        {/* <h1>{width}</h1>
        <h1>{height}</h1> */}
        <Grid sideLength={sides} />
      </div>
    </div>
  );
}

export default App;
