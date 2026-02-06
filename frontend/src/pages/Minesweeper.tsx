import React, { useState, useEffect, useRef } from "react";
import "./Minesweeper.css";
import OctGrid from "../Grid/OctGrid.tsx";
import MinesweeperInfoBoard from "../MinesweeperInfoBoard/MinesweeperInfoBoard.tsx";
import axios from "axios";
import { MineCellInfo } from "../Cell/MineCellInfo.tsx";
import { BACKEND_URL } from "../constants.ts";
import { table } from "console";

export const api = axios.create({
  baseURL: BACKEND_URL,
});

// self.numCells = ((self.sideLength * 2 - 2) * (self.sideLength * 2 - 1) - (self.sideLength) * (self.sideLength - 1)) + 2 * self.sideLength - 1

interface MinesweeperProps {
  darkMode: boolean;
}

type BeeParticle = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  life: number;
};

const Minesweeper: React.FC<MinesweeperProps> = ({ darkMode }) => {
  const [level, setLevel] = useState("Easy");
  const [sides, setSides] = useState(6);
  const [numCells, setNumCells] = useState(91);
  const [flags, setFlags] = useState(18);
  const [time, setTime] = useState(0);
  const [board, setBoard] = useState<MineCellInfo[]>([]);
  const [gameID, setGameID] = useState<string>("");
  const [gameState, setGameState] = useState("");
  const [lostCellKey, setLostCellKey] = useState<number | null>(null);

  const [startTime, setStartTime] = useState<number | null>(null);

  // Replace entire board (start/reset)
  const replaceBoard = (newBoard: MineCellInfo[]) => {
    setBoard(newBoard);
  };

  const getSides = (level: string) => {
    switch (level) {
      case "Easy":
        return 5;
      case "Medium":
        return 9;
      case "Hard":
        return 13;
      case "Extreme":
        return 17;
      case "Impossible":
        return 21;
      default:
        return 5;
    }
  };

  const initBoard = (size: number) => {
    const totalCells = numCells; // approximate for hex grid
    const newBoard: MineCellInfo[] = Array.from(
      { length: totalCells },
      (_, i) => ({
        key: i + 1,
        kind: "hidden",
      })
    );
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
    api.post("/minesweeper_api/start/", { level }).then((res) => {
      const newSides = getSides(level);
      setSides(newSides); // set sides immediately
      const tableLength = 2 * sides - 1;
      const totalCells =
        tableLength * tableLength -
        2 * (Math.floor(tableLength / 2) * Math.floor(tableLength / 2 + 1));
      setNumCells(totalCells);

      setGameID(res.data.game_ID); // ✅ set gameID from backend
      setGameState(res.data.progress);
      setFlags(res.data.flags ?? flags);

      // Lazy revelation: all hidden
      const hiddenBoard: MineCellInfo[] = Array.from(
        { length: totalCells },
        (_, i) => ({
          key: i + 1,
          kind: "hidden",
        })
      );
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
          setFlags(13);
          setTime(0);
          break;
        case "Medium":
          setFlags(54);
          setTime(0);
          break;
        case "Hard":
          setFlags(109);
          setTime(0);
          break;
        case "Extreme":
          setFlags(189);
          setTime(0);
          break;
        case "Impossible":
          setFlags(292);
          setTime(0);
          break;
        default:
          setFlags(13);
          setTime(0);
      }

      setNumCells(
        (sides * 2 - 2) * (sides * 2 - 1) - sides * (sides - 1) + 2 * sides - 1
      );
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

    api.post(`/minesweeper_api/${gameID}/reset/`).then((res) => {
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

  const handleGameState = (state: string, key?: number) => {
    setGameState(state);
    if (state === "LOST" && key !== undefined) {
      setLostCellKey(key);
      console.log("BOOM");
      console.log(key);
    }
  };

  useEffect(() => {
    if (gameState === "LOST") {
      document.body.classList.add("shake");

      const timeout = setTimeout(() => {
        document.body.classList.remove("shake");
      }, 350);

      return () => clearTimeout(timeout);
    }
  }, [gameState]);

  const MAX_SIDES = 24;
  const FIXED_RATIO =
    ((2 * MAX_SIDES - 1) / (3 * MAX_SIDES - 1)) * Math.sqrt(3);

  const FIXED_WIDTH = 90 / FIXED_RATIO;

  let ratio = ((2 * sides - 1) / (3 * sides - 1)) * Math.sqrt(3);
  let height = 90;
  let width = height / ratio;

  return (
    <div
      className={`oct-board-complete ${
        darkMode ? "dark" : "light"
      } ${gameState}`}
    >
      <div
        className="oct-grid-area"
        style={{
          width: `${FIXED_WIDTH}vmin`,
          height: `100%`,
        }}
      >
        <div className="Minesweeper" onContextMenu={(e) => e.preventDefault()}>
          <OctGrid
            sideLength={sides}
            level={level}
            game_ID={gameID}
            board={board}
            lostCellKey={lostCellKey}
            onUpdateBoard={mergeBoardChanges}
            onUpdateFlags={setFlags}
            onUpdateGameState={handleGameState}
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

export default Minesweeper;
