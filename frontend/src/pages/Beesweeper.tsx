import React, { useState, useEffect, useRef, JSX } from "react";
import "./Beesweeper.css";
import Grid from "../Grid/Grid.tsx";
import BeesweeperInfoBoard from "../MinesweeperInfoBoard/BeesweeperInfoBoard.tsx";
import axios from "axios";
import { MineCellInfo } from "../Cell/MineCellInfo.tsx";
import { BACKEND_URL } from "../constants.ts";

export const api = axios.create({
  baseURL: BACKEND_URL,
});

type BeeParticle = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  life: number;
};

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
  const [lostCellKey, setLostCellKey] = useState<number | null>(null);

  const [startTime, setStartTime] = useState<number | null>(null);

  const beesRef = useRef<BeeParticle[]>([]);
  const [bees, setBees] = useState<BeeParticle[]>([]);
  const rafRef = useRef<number | null>(null);

  // Replace entire board (start/reset)
  const replaceBoard = (newBoard: MineCellInfo[]) => {
    setBoard(newBoard);
  };

  const getSides = (level: string) => {
    switch (level) {
      case "Easy":
        return 6;
      case "Medium":
        return 10;
      case "Hard":
        return 14;
      case "Extreme":
        return 18;
      case "Impossible":
        return 24;
      default:
        return 6;
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
    api.post("/beesweeper_api/start/", { level }).then((res) => {
      const newSides = getSides(level);
      setSides(newSides); // set sides immediately
      const totalCells =
        (newSides * 2 - 2) * (newSides * 2 - 1) -
        newSides * (newSides - 1) +
        2 * newSides -
        1;
      setNumCells(totalCells);

      setGameID(res.data.game_ID); // ✅ set gameID from backend
      setGameState(res.data.progress);
      setFlags(flags);

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


  

  const handleGameState = (state: string, key?: number) => {
    setGameState(state);
    if (state === "LOST" && key !== undefined) {
      setLostCellKey(key);
    }
  };

  useEffect(() => {
    if (gameState === "NS") {
      setNumCells(
        (sides * 2 - 2) * (sides * 2 - 1) - sides * (sides - 1) + 2 * sides - 1
      );
      setTime(0);
    }
  }, [gameState, level]);

  useEffect(() => {
    if (gameState === "LOST") {
      document.body.classList.add("shake");

      const timeout = setTimeout(() => {
        document.body.classList.remove("shake");
      }, 350);

      return () => clearTimeout(timeout);
    }
  }, [gameState]);

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
      setFlags(res.data.flags);

      // set game state last to trigger timer effect
      setGameState(res.data.progress);
    });
  };







  useEffect(() => {
    if (gameState !== "LOST" || lostCellKey === null) return;

    const cellEl = document.getElementById(`cell-${lostCellKey}`);
    const container = document.querySelector(".hex-grid-area");

    if (!cellEl || !container) return;

    const cellRect = cellEl.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    const x = cellRect.left - containerRect.left + cellRect.width / 2;
    const y = cellRect.top - containerRect.top + cellRect.height / 2;

    const COUNT = 40;

    beesRef.current = Array.from({ length: COUNT }, (_, i) => ({
      id: i,
      x,
      y,
      vx: (Math.random() - 0.5) * 7,
      vy: (Math.random() - 0.5) * 7,
      rot: Math.random() * 360,
      life: 90 + Math.random() * 30,
    }));

    animateBees();
  }, [gameState, lostCellKey]);

  const animateBees = () => {
    beesRef.current.forEach((bee) => {
      bee.x += bee.vx;
      bee.y += bee.vy;
      bee.vy += 0.15;
      bee.rot += 12;
      bee.life -= 1;
    });

    beesRef.current = beesRef.current.filter((b) => b.life > 0);

    setBees([...beesRef.current]);

    if (beesRef.current.length > 0) {
      rafRef.current = requestAnimationFrame(animateBees);
    } else {
      setBees([]);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    }
  };

  const MAX_SIDES = 24;
  const FIXED_RATIO =
    ((2 * MAX_SIDES - 1) / (3 * MAX_SIDES - 1)) * Math.sqrt(3);

  const FIXED_WIDTH = 90 / FIXED_RATIO;

  let ratio = ((2 * sides - 1) / (3 * sides - 1)) * Math.sqrt(3);
  let height = 90;
  let width = height / ratio;

  return (
    <div
      className={`board-complete ${darkMode ? "dark" : "light"} ${gameState}`}
    >
      <div
        className="hex-grid-area"
        style={{
          width: `${FIXED_WIDTH}vmin`,
          height: "100%",
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
            onUpdateGameState={handleGameState}
          />
          <div className="bee-particles">
            {bees.map((b) => (
              <div
                key={b.id}
                className="bee-particle"
                style={{
                  left: `${b.x}px`,
                  top: `${b.y}px`,
                  transform: `rotate(${b.rot}deg)`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
      <div className={`beeInfoBoard ${darkMode ? "dark" : "light"}`}>
        <BeesweeperInfoBoard
          level={level}
          setLevel={setLevel}
          flagsLeft={flags}
          onReset={handleReset}
          time={time}
          gameState={gameState}
        />
      </div>
      <div>
        <h2 style={{ color: "white" }}>{}</h2>
      </div>
    </div>
  );
};

export default Beesweeper;
