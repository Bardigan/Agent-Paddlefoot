import { useState, useEffect, useRef, useContext } from "react";
import "./GameDeck.scss";
import { GameContext } from "../context/GameContext";
import Popup from "../lib/Popup";

const PLAYER_SPEED = 5; // Player movement speed
const ENEMY_SPEED = 10; // Enemy movement speed (twice as fast)
const ENEMY_MOVE_INTERVAL = 250; // Enemy move interval in milliseconds (twice as fast)
const ENEMY_STEPS_BEFORE_CHANGE = 5; // Number of steps before changing direction
const NUM_WALLS = 10; // Number of walls to generate
const MAX_WALL_GENERATION_ATTEMPTS = 100; // Maximum attempts to generate a wall without overlap
const MAX_SPAWN_ATTEMPTS = 100; // Maximum attempts to spawn player or enemy without overlap
const NUM_COINS = 5; // Number of coins to generate

interface Wall {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface Position {
  left: number;
  top: number;
}

interface Enemy extends Position {
  direction: number;
  steps: number;
  type: "normal" | "doctor";
}

interface Coin extends Position {}

interface Door extends Position {}

const generateWalls = (): Wall[] => {
  const walls: Wall[] = [];
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  const safeArea = { left: 90, top: 220, width: 100, height: 100 }; // Define the safe area around the player's respawn point

  for (let i = 0; i < NUM_WALLS; i++) {
    let width = 0,
      height = 0,
      left = 0,
      top = 0;
    let attempts = 0;
    do {
      if (attempts > MAX_WALL_GENERATION_ATTEMPTS) {
        break;
      }
      width = Math.ceil((Math.random() * (windowWidth / 5)) / 50) * 50; // Width in multiples of 50px
      height = Math.ceil((Math.random() * (windowHeight / 5)) / 50) * 50; // Height in multiples of 50px
      width = Math.max(width, 50); // Ensure minimum width is 50px
      height = Math.max(height, 50); // Ensure minimum height is 50px
      left = Math.random() * (windowWidth - width);
      top = Math.random() * (windowHeight - height - 60);
      attempts++;
    } while (
      checkWallOverlap(left, top, width, height, walls) ||
      checkSafeAreaCollision(left, top, width, height, safeArea)
    );

    walls.push({ left, top, width, height });
  }

  return walls;
};

const checkSafeAreaCollision = (
  left: number,
  top: number,
  width: number,
  height: number,
  safeArea: { left: number; top: number; width: number; height: number }
): boolean => {
  return (
    left < safeArea.left + safeArea.width &&
    left + width > safeArea.left &&
    top < safeArea.top + safeArea.height &&
    top + height > safeArea.top
  );
};

const checkWallOverlap = (
  left: number,
  top: number,
  width: number,
  height: number,
  walls: Wall[]
): boolean => {
  return walls.some(
    (wall) =>
      left < wall.left + wall.width &&
      left + width > wall.left &&
      top < wall.top + wall.height &&
      top + height > wall.top
  );
};

const checkWallCollision = (
  left: number,
  top: number,
  width: number,
  height: number,
  walls: Wall[]
): boolean => {
  return walls.some(
    (wall) =>
      left < wall.left + wall.width &&
      left + width > wall.left &&
      top < wall.top + wall.height &&
      top + height > wall.top
  );
};

const checkWallSpawn = (
  left: number,
  top: number,
  width: number,
  height: number,
  walls: Wall[]
): boolean => {
  return !checkWallCollision(left, top, width, height, walls);
};

const checkPlayerSafeAreaCollision = (
  left: number,
  top: number,
  radius: number,
  playerPos: Position
): boolean => {
  const dx = left - playerPos.left;
  const dy = top - playerPos.top;
  return Math.sqrt(dx * dx + dy * dy) < radius;
};

const generateEnemies = (
  numEnemies: number,
  numDoctors: number,
  walls: Wall[],
  playerPos: Position
): Enemy[] => {
  const enemies: Enemy[] = [];
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  const playerSafeRadius = 100;

  const generateEnemy = (type: "normal" | "doctor") => {
    let left: number = 0,
      top: number = 0;
    let attempts = 0;
    const width = type === "doctor" ? 40 : 50;
    const height = type === "doctor" ? 80 : 50;

    do {
      if (attempts > MAX_SPAWN_ATTEMPTS) {
        break;
      }
      left = Math.random() * (windowWidth - width);
      top = Math.random() * (windowHeight - 60 - height);
      attempts++;
    } while (
      !checkWallSpawn(left, top, width, height, walls) ||
      checkPlayerSafeAreaCollision(left, top, playerSafeRadius, playerPos)
    );

    enemies.push({
      left,
      top,
      direction: Math.floor(Math.random() * 4),
      steps: 0,
      type,
    });
  };

  for (let i = 0; i < numEnemies; i++) {
    generateEnemy("normal");
  }

  for (let i = 0; i < numDoctors; i++) {
    generateEnemy("doctor");
  }

  return enemies;
};

const generateCoins = (
  numCoins: number,
  walls: Wall[],
  enemies: Enemy[],
  playerPos: Position
): Coin[] => {
  const coins: Coin[] = [];
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  const playerSafeRadius = 100;

  for (let i = 0; i < numCoins; i++) {
    let left: number = 0,
      top: number = 0;
    let attempts = 0;
    do {
      if (attempts > MAX_SPAWN_ATTEMPTS) {
        break;
      }
      left = Math.random() * (windowWidth - 40);
      top = Math.random() * (windowHeight - 60 - 40);
      attempts++;
    } while (
      !checkWallSpawn(left, top, 40, 40, walls) ||
      checkPlayerSafeAreaCollision(left, top, playerSafeRadius, playerPos) ||
      enemies.some(
        (enemy) =>
          left < enemy.left + 50 &&
          left + 40 > enemy.left &&
          top < enemy.top + 50 &&
          top + 40 > enemy.top
      ) ||
      coins.some(
        (coin) =>
          left < coin.left + 40 &&
          left + 40 > coin.left &&
          top < coin.top + 40 &&
          top + 40 > coin.top
      )
    );

    coins.push({ left, top });
  }
  return coins;
};

const PlatformerGame: React.FC = () => {
  const [playerPos, setPlayerPos] = useState<Position>({ left: 90, top: 220 });
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [walls, setWalls] = useState<Wall[]>([]);
  const [coins, setCoins] = useState<Coin[]>([]);
  const [door, setDoor] = useState<Door | null>(null);
  const [playerDirection, setPlayerDirection] = useState<string | null>(null);
  const [scoreIncrement, setScoreIncrement] = useState<number>(0);
  const animationRef = useRef<number | null>(null);
  const lastEnemyMove = useRef<number>(Date.now());
  const [gameIsStarted, setGameIsStarted] = useState<boolean>(false);
  const [showPopup, setShowPopup] = useState<boolean>(false);

  const context = useContext(GameContext);

  const handleKeyDown = (event: KeyboardEvent) => {
    !gameIsStarted && setGameIsStarted(true);
    !gameIsStarted && !context?.gameStatus && context?.setGameStatus(true);
    if (event.key === "ArrowUp") setPlayerDirection("up");
    if (event.key === "ArrowDown") setPlayerDirection("down");
    if (event.key === "ArrowLeft") setPlayerDirection("left");
    if (event.key === "ArrowRight") setPlayerDirection("right");
  };

  const handleKeyUp = () => {
    setPlayerDirection(null);
  };

  const movePlayer = () => {
    if (!playerDirection) return;

    setPlayerPos((prev) => {
      let newLeft = prev.left;
      let newTop = prev.top;
      if (playerDirection === "left")
        newLeft = Math.max(prev.left - PLAYER_SPEED, 0);
      if (playerDirection === "right")
        newLeft = Math.min(prev.left + PLAYER_SPEED, window.innerWidth - 40);
      if (playerDirection === "up")
        newTop = Math.max(prev.top - PLAYER_SPEED, 0);
      if (playerDirection === "down")
        newTop = Math.min(
          prev.top + PLAYER_SPEED,
          window.innerHeight - 60 - 50
        );

      if (checkWallCollision(newLeft, newTop, 40, 50, walls)) {
        return prev; // If collision detected, don't move
      }

      return { left: newLeft, top: newTop };
    });
  };

  const moveEnemies = () => {
    setEnemies((prevEnemies) =>
      prevEnemies.map((enemy) => {
        let newTop = enemy.top;
        let newLeft = enemy.left;
        let newDirection = enemy.direction;
        let newSteps = enemy.steps;

        if (newSteps >= ENEMY_STEPS_BEFORE_CHANGE) {
          newDirection = Math.floor(Math.random() * 4); // Change direction
          newSteps = 0;
        }

        // Check if the new direction would cause a collision with a wall
        let potentialTop = newTop;
        let potentialLeft = newLeft;
        const enemyWidth = enemy.type === "doctor" ? 40 : 50;
        const enemyHeight = enemy.type === "doctor" ? 80 : 50;
        const level = context?.level ? context?.level : 1;
        const enemySpeed =
          enemy.type === "doctor"
            ? ENEMY_SPEED * 4 * level
            : ENEMY_SPEED * level;

        if (newDirection === 0) potentialTop -= enemySpeed; // up
        if (newDirection === 1) potentialTop += enemySpeed; // down
        if (newDirection === 2) potentialLeft -= enemySpeed; // left
        if (newDirection === 3) potentialLeft += enemySpeed; // right

        if (
          checkWallCollision(
            potentialLeft,
            potentialTop,
            enemyWidth,
            enemyHeight,
            walls
          )
        ) {
          // If collision detected, reverse direction
          newDirection = (newDirection + 2) % 4;
          potentialTop = newTop;
          potentialLeft = newLeft;
          if (newDirection === 0) potentialTop -= enemySpeed; // up
          if (newDirection === 1) potentialTop += enemySpeed; // down
          if (newDirection === 2) potentialLeft -= enemySpeed; // left
          if (newDirection === 3) potentialLeft += enemySpeed; // right

          // If reversing direction also causes a collision, choose a new random direction
          if (
            checkWallCollision(
              potentialLeft,
              potentialTop,
              enemyWidth,
              enemyHeight,
              walls
            )
          ) {
            let attempts = 0;
            do {
              newDirection = Math.floor(Math.random() * 4);
              potentialTop = newTop;
              potentialLeft = newLeft;
              if (newDirection === 0) potentialTop -= enemySpeed; // up
              if (newDirection === 1) potentialTop += enemySpeed; // down
              if (newDirection === 2) potentialLeft -= enemySpeed; // left
              if (newDirection === 3) potentialLeft += enemySpeed; // right
              attempts++;
            } while (
              checkWallCollision(
                potentialLeft,
                potentialTop,
                enemyWidth,
                enemyHeight,
                walls
              ) &&
              attempts < 4
            );
          }
        }

        // If no collision, update position
        newTop = potentialTop;
        newLeft = potentialLeft;

        // Ensure enemies stay within the screen
        newTop = Math.max(
          0,
          Math.min(newTop, window.innerHeight - 60 - enemyHeight)
        );
        newLeft = Math.max(
          0,
          Math.min(newLeft, window.innerWidth - enemyWidth)
        );

        return {
          ...enemy,
          top: newTop,
          left: newLeft,
          direction: newDirection,
          steps: newSteps + 1,
        };
      })
    );
  };

  const resetGame = () => {
    setGameIsStarted(false);
    setPlayerDirection(null);
    setDoor(null);
    setPlayerPos({ left: 90, top: 220 });
    setWalls(generateWalls()); // Regenerate walls
    setEnemies(generateEnemies(10, 5, walls, { left: 90, top: 220 }));
    setCoins(generateCoins(NUM_COINS, walls, enemies, { left: 90, top: 220 }));

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const gameLoop = () => {
    if (!showPopup) {
      movePlayer();

      const now = Date.now();
      if (now - lastEnemyMove.current >= ENEMY_MOVE_INTERVAL) {
        gameIsStarted && moveEnemies();
        lastEnemyMove.current = now;
      }

      animationRef.current = requestAnimationFrame(gameLoop);
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [playerDirection]);

  const handlePlayerLost = () => {
    setPlayerDirection(null); // Stop player movement
    context?.setGameStatus(false); // game over
    setShowPopup(true);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current); // Stop the game loop
    }
  };

  useEffect(() => {
    if (context?.gameStatus === false) {
      handlePlayerLost();
    }
  }, [context?.gameStatus]);

  useEffect(() => {
    enemies.forEach((enemy) => {
      const enemyWidth = enemy.type === "doctor" ? 40 : 50;
      const enemyHeight = enemy.type === "doctor" ? 80 : 50;
      if (
        playerPos.left < enemy.left + enemyWidth &&
        playerPos.left + 40 > enemy.left &&
        playerPos.top < enemy.top + enemyHeight &&
        playerPos.top + 50 > enemy.top
      ) {
        handlePlayerLost();
      }
    });
  }, [playerPos, enemies]);

  useEffect(() => {
    const generatedWalls = generateWalls();
    setWalls(generatedWalls);
  }, []);

  useEffect(() => {
    if (walls.length > 0) {
      setEnemies(generateEnemies(10, 1, walls, { left: 90, top: 220 }));
      setCoins(
        generateCoins(NUM_COINS, walls, enemies, { left: 90, top: 220 })
      );
    }
  }, [walls]);

  useEffect(() => {
    const handleResize = () => {
      resetGame();
      context?.setGameStatus(null);
      context?.setScore(0);
      setScoreIncrement(0);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    setCoins((prevCoins) =>
      prevCoins.filter((coin) => {
        const isColliding =
          playerPos.left < coin.left + 40 &&
          playerPos.left + 40 > coin.left &&
          playerPos.top < coin.top + 40 &&
          playerPos.top + 50 > coin.top;
        if (isColliding) {
          setScoreIncrement((prev) => prev + 1);
        }
        return !isColliding;
      })
    );
  }, [playerPos]);

  useEffect(() => {
    if (scoreIncrement > 0) {
      context?.setScore(context.score + scoreIncrement);
      setScoreIncrement(0);
    }
  }, [scoreIncrement, context]);

  useEffect(() => {
    if (coins.length === 0 && !door && gameIsStarted) {
      // Spawn the door at a random position
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      let doorLeft: number = 0,
        doorTop: number = 0;
      let attempts = 0;
      const doorSize = 50;

      do {
        if (attempts > MAX_SPAWN_ATTEMPTS) {
          break;
        }
        doorLeft = Math.random() * (windowWidth - doorSize);
        doorTop = Math.random() * (windowHeight - 60 - doorSize);
        attempts++;
      } while (
        checkWallCollision(doorLeft, doorTop, doorSize, doorSize, walls) ||
        enemies.some(
          (enemy) =>
            doorLeft < enemy.left + (enemy.type === "doctor" ? 40 : 50) &&
            doorLeft + doorSize > enemy.left &&
            doorTop < enemy.top + (enemy.type === "doctor" ? 80 : 50) &&
            doorTop + doorSize > enemy.top
        ) ||
        (doorLeft < playerPos.left + 40 &&
          doorLeft + doorSize > playerPos.left &&
          doorTop < playerPos.top + 50 &&
          doorTop + doorSize > playerPos.top)
      );

      setDoor({ left: doorLeft, top: doorTop });
    }
  }, [coins, door, walls, enemies, playerPos]);

  useEffect(() => {
    if (door) {
      const doorWidth = 50;
      const doorHeight = 50;
      if (
        playerPos.left < door.left + doorWidth &&
        playerPos.left + 40 > door.left &&
        playerPos.top < door.top + doorHeight &&
        playerPos.top + 50 > door.top
      ) {
        setPlayerDirection(null); // Stop player movement
        resetGame(); // next level
        context?.setLevel(context?.level + 1);
      }
    }
  }, [playerPos, door]);

  const handleClosePopup = () => {
    setShowPopup(false);
    resetGame();
    context?.setLevel(1);
    context?.setGameStatus(null);
    context?.setScore(0);
    setScoreIncrement(0);
  };

  const ifColorDoctor = (type: string) => {
    if (type === "doctor" && context?.colorMode) {
      return "doctor";
    } else if (type === "doctor" && !context?.colorMode) {
      return "doctorC";
    } else {
      return "normal";
    }
  };

  return (
    <div
      className={context?.colorMode ? "platformer-gameWrp" : "platformer-gameWrpC"}
    >
      <div className="platformer-game">
        <div
          className={context?.colorMode ? "player" : "playerC"}
          style={{ left: `${playerPos.left}px`, top: `${playerPos.top}px` }}
        ></div>
        {enemies.map((enemy, index) => (
          <div
            key={index}
            className={`enemy ${ifColorDoctor(enemy.type)}`}
            style={{ left: `${enemy.left}px`, top: `${enemy.top}px` }}
          ></div>
        ))}
        {walls.map((wall, index) => (
          <div
            key={index}
            className={context?.colorMode ? "wall" : "wallC"}
            style={{
              left: `${wall.left}px`,
              top: `${wall.top}px`,
              width: `${wall.width}px`,
              height: `${wall.height}px`,
            }}
          ></div>
        ))}
        {coins.map((coin, index) => (
          <div
            key={index}
            className="coin"
            style={{ left: `${coin.left}px`, top: `${coin.top}px` }}
          ></div>
        ))}
        {door && (
          <div
            className="door"
            style={{
              left: `${door.left}px`,
              top: `${door.top}px`,
              width: "50px",
              height: "50px",
            }}
          ></div>
        )}
        <Popup show={showPopup} onClose={handleClosePopup} title="Game Over" />
        {!gameIsStarted && (
          <div className="initial-message">
            <span className={`forCarrot`}>
              <span className={`${!gameIsStarted && `blinking`}`}>
                Press arrows to move. Avoid the enemies!
              </span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlatformerGame;
