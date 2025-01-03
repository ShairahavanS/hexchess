import React from "react";
// import logo from "./HexChessLogo.svg";
import "./App.css";
import Grid from "./Grid/Grid.tsx";

function App() {
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
      <Grid />
    </div>
  );
}

export default App;
