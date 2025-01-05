import React from "react";
import "./Navbar.css";

const Navbar: React.FC = () => {
  return (
    <nav className="navbar">
      <h1 className="logo"> Logo for now</h1>
      <img
        height="90px"
        src="https://img.mlbstatic.com/mlb-images/image/private/t_1x1/t_w2208/mlb/j6wmxwwc2ccz2piz4yd0.jpg"
      ></img>
      <ul className="navbar-links">
        <li className="navbar-item">
          <a href="/">Home</a>
        </li>
        <li className="navbar-item">
          <a href="/Beesweeper">Beesweeper</a>
        </li>
        <li className="navbar-item">
          <a href="/Chess">Chess</a>
        </li>
        <li className="navbar-item">
          <a href="/Checkers">Checkers</a>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
