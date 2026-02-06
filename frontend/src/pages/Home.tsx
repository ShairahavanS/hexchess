import React from "react";
import { Link } from "react-router-dom";
import checkerPiece from "../images/checkerPieces/Red Checker Piece.svg";
import chessPiece from "../images/chessPieces/Chess_rdt45.svg";
import bee from "../images/beesweeper/HexBee.svg";
import flag from "../images/minesweeper/Flag.svg";
import "./Home.css";

interface HomeProps {
  darkMode: boolean;
}

const Home: React.FC<HomeProps> = ({ darkMode }) => {
  const games = [
    { img: bee, name: "Beesweeper", path: "/Beesweeper" },
    { img: flag, name: "Minesweeper", path: "/Minesweeper" },
    { img: chessPiece, name: "Chess", path: "/Chess" },
    { img: checkerPiece, name: "Checkers", path: "/Checkers" },
  ];

  return (
    <div className={`home-container ${darkMode ? "dark" : "light"}`}>
      <h1>Welcome to Hex Games</h1>
      <div className="games-list">
        {games.map((game) => (
          <Link key={game.name} to={game.path} className="game-item">
            <img src={game.img} alt={game.name} />
            <span>{game.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Home;
