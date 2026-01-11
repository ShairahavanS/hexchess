import React, { useState, useEffect, useRef } from "react";
import "./Beesweeper.css";
import Grid from "../Grid/Grid.tsx";
import MinesweeperInfoBoard from "../MinesweeperInfoBoard/MinesweeperInfoBoard.tsx";
import axios from "axios";
import { MineCellInfo } from "../Cell/MineCellInfo.tsx";
import { BACKEND_URL } from "../constants.ts";

export const api = axios.create({
  baseURL: BACKEND_URL,
});

// self.numCells = ((self.sideLength * 2 - 2) * (self.sideLength * 2 - 1) - (self.sideLength) * (self.sideLength - 1)) + 2 * self.sideLength - 1

interface BeesweeperProps {
  darkMode: boolean;
}

const Beesweeper: React.FC<BeesweeperProps> = ({ darkMode }) => {
  const [level, setLevel] = useState("Easy");
  const [sides, setSides] = useState(6);
  const [numCells, setNumCells] = useState(91);
  const [flags, setFlags] = useState(18);
  const [time, setTime] = useState(0);
  const [board, setBoard] = useState<MineCellInfo[]>([]);
  const [gameID, setGameID] = useState<string>("");
  const [gameState, setGameState] = useState("");

  const [startTime, setStartTime] = useState<number | null>(null);

  // Replace entire board (start/reset)
  const replaceBoard = (newBoard: MineCellInfo[]) => {
    setBoard(newBoard);
  };

  const getSides = (level: string) => {
    switch (level) {
      case "Easy": return 6;
      case "Medium": return 10;
      case "Hard": return 16;
      case "Extreme": return 24;
      case "Impossible": return 50;
      default: return 6;
    }
  };

  const initBoard = (size: number) => {
    const totalCells = numCells; // approximate for hex grid
    const newBoard: MineCellInfo[] = Array.from({ length: totalCells }, (_, i) => ({
      key: i + 1,
      kind: "hidden",
    }));
    setBoard(newBoard);
  };

  // Merge only changed cells (click/flag)
  const mergeBoardChanges = (changedCells: MineCellInfo[]) => {
    setBoard((prev) => {
      const map = new Map(prev.map((c) => [c.key, c]));

      changedCells.forEach((cell) => {
        map.set(cell.key, cell); // overwrite changed cell
      });

      return Array.from(map.values());
    });
  };

  const startGame = () => {
    api.post("/beesweeper_api/start/", { level }).then((res) => {
      const newSides = getSides(level);
      setSides(newSides); // set sides immediately
      const totalCells = ((newSides * 2 - 2) * (newSides * 2 - 1) - newSides * (newSides - 1)) + 2 * newSides - 1;
      setNumCells(totalCells);
  
      setGameID(res.data.game_ID); // ✅ set gameID from backend
      setGameState(res.data.progress);
      setFlags(res.data.flags ?? flags);
  
      // Lazy revelation: all hidden
      const hiddenBoard: MineCellInfo[] = Array.from({ length: totalCells }, (_, i) => ({
        key: i + 1,
        kind: "hidden",
      }));
      setBoard(hiddenBoard);
  
      setStartTime(res.data.progress === "IP" ? Date.now() : null);
      setTime(0);
    });
  };

  useEffect(() => {
    startGame(); // start new game whenever level changes
  }, [level]);

  useEffect(() => {
    if (gameState === "NS") {
      switch (level) {
        case "Easy":
          setFlags(18);
          setTime(0);
          break;
        case "Medium":
          setFlags(54);
          setTime(0);
          break;
        case "Hard":
          setFlags(144);
          setTime(0);
          break;
        case "Extreme":
          setFlags(331);
          setTime(0);
          break;
        case "Impossible":
          setFlags(1470);
          setTime(0);
          break;
        default:
          setFlags(18);
          setTime(0);
      }
      
      setNumCells(((sides * 2 - 2) * (sides * 2 - 1) - (sides) * (sides - 1)) + 2 * sides - 1);
      setTime(0);
    }
  }, [gameState, level]);

  // TIMER EFFECT
  useEffect(() => {
    // Only run timer if game is in progress
    if (gameState !== "IP") {
      setStartTime(null); // stop timer if not in progress
      return;
    }

    // Record startTime if not already set
    if (!startTime) setStartTime(Date.now());

    // Tick every second
    const interval = setInterval(() => {
      if (startTime) {
        setTime(Math.floor((Date.now() - startTime) / 1000));
      }
    }, 1000);

    // Cleanup interval when effect re-runs or component unmounts
    return () => clearInterval(interval);
  }, [gameState, startTime]);




  const handleReset = () => {
    if (!gameID) return;
  
    api.post(`/beesweeper_api/${gameID}/reset/`).then((res) => {
      // stop any ongoing timer immediately
      setStartTime(res.data.progress === "IP" ? Date.now() : null);
      setTime(0);
  
      // lazy reset board
      setBoard((prev) => prev.map((c) => ({ key: c.key, kind: "hidden" })));
      setFlags(res.data.flags ?? flags);
  
      // set game state last to trigger timer effect
      setGameState(res.data.progress);
    });
  };

  let ratio = ((2 * sides - 1) / (3 * sides - 1)) * Math.sqrt(3);
  let height = 90;
  let width = height / ratio;

  return (
    <div className={`board-complete ${darkMode ? "dark" : "light"}`}>
      <div
        className="grid-area"
        style={{
          width: `${width}vmin`,
          height: `100%`,
        }}
      >
        <div className="Beesweeper" onContextMenu={(e) => e.preventDefault()}>
          <Grid
            sideLength={sides}
            level={level}
            game_ID={gameID}
            board={board}
            onUpdateBoard={mergeBoardChanges}
            onUpdateFlags={setFlags}
            onUpdateGameState={setGameState}
          />
        </div>
      </div>
      <div className="infoBoard">
        <MinesweeperInfoBoard
          level={level}
          setLevel={setLevel}
          flagsLeft={flags}
          onReset={handleReset}
          time={time}
        />
      </div>
      <div>
        <h2 style={{ color: "white" }}>{}</h2>
      </div>
    </div>
  );
};

export default Beesweeper;
