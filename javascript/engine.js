import { drawMainBoard, drawTetromino, redrawTetrominos, drawHud, drawNextTetromino, drawScore, drawLevel, drawMana } from "./draws.js";
import { clearMainBoard, clearHud, clearFilteredRows, filterRows, copyImageData, pasteImageData, updateGrid, shiftFilteredCols, initiateId, initiateTetrominoInfo, shiftFilteredRows, checkForClears, gameoverCheck, clearSpecial, checkForRedraws, prepareDropCells, clearSet } from "./updates.js";
import { tetrominoShapes } from "./tetrominos.js";
import { Rows, Cols, createGrid, Randomize, Position, tetrominoObjectPool, activeTetrominoPool, particlesObjectPool, playGameButton, startBtn, restartBtn, resumeBtn, descriptionTxt, gameoverTxt } from "./config.js";
import { rotation } from "./rotation.js";
import { calculateClearingScore, calculateCollisionScore, calculateLevel, randomTetromino } from "./metrics.js";
import { ninjaStrike } from "./animations/ninjaStrike.js";
import { drops } from "./animations/drops.js";
import { animateClears } from "./animations/clears.js";
import { artilleryStrike } from "./animations/artilleryStrike.js";
import { invasionStrike } from "./animations/invasionStrike.js";
import { pauseCurrentTheme, playClear, playCollide, playGameOver, playLevelUp, playMainTheme, resumeCurrentTheme, stopMainTheme, stopSovietTheme } from './sound.js';
import { riotStrike } from "./animations/riotStrike.js";

export let grid = [];
export let activeTetrominos = [];
export let objectPoolArray;
export let particlesPool;
export let reuseObjectIdArray = [];
export let tetrominoId = 0;
export let mainBoardData;
export let emptyBoardData;
export let clearBoardData;
export let tetrominosArray = [];
export let filterRowsData = [];
export let collectDropCells = new Set();
export let dropCellsData = [];
export let isCollision = false;
export let targetRow = 0;
export let clearRowsMultiplier = 1;
export let scoreBonus = 10;
export let variableGoalSystem = 0;
export let tetromino;
export let nextTetromino;
export let score = 0;
export let level = 1;
export let manaLevel = 92;
export let pause = true;
export let previousMouseX = 0;
export let previousMouseY = 0;
export let previousTouchX = 0;
export let previousTouchY = 0;
export let touchStartX = 0;
export let touchStartY = 0;
export let isDragging = false;
export let gameplayStatus;
export let gameplayAcceleration = 1000;
export let menuOpened = true;
export let gameStarted = false;

export class Tetromino {
     constructor(name, color, cells, positionZero) {
          this.name = name;
          this.color = color;
          this.cells = cells;
          this.positionZero = positionZero || JSON.parse(JSON.stringify(cells));
     }

     moveDown() {
          if (this.cells.some(cell =>
               cell.y === Rows - 1 ||
               grid[cell.y + 1][cell.x] !== 0)) {
               isCollision = true;
          }

          else {
               this.cells.forEach(cell => cell.y += 1);
          }
     }

     moveLeft() {
          if (this.cells.some(cell =>

               cell.x === 0 ||
               grid[cell.y][cell.x - 1] !== 0)) {
               return;
          }
          this.cells.forEach(cell => cell.x -= 1);
     }

     moveRight() {
          if (this.cells.some(cell =>

               cell.x === Cols - 1 ||
               grid[cell.y][cell.x + 1] !== 0)) {
               return;
          }
          this.cells.forEach(cell => cell.x += 1);
     }

     defaultCoordinates() {
          this.cells = JSON.parse(JSON.stringify(this.positionZero));
     }
}

initializeGame();
drawNextTetromino();

function assembleTetrominos() {
     for (let shape of tetrominoShapes) {
          for (let cell of shape.cells) {

               cell.x += Position;
          }

          tetrominosArray.push(
               new Tetromino(
                    shape.name,
                    shape.color,
                    shape.cells
               )
          )
     }
}

function resetGameplayInterval() {
     if (gameplayStatus) clearInterval(gameplayStatus);
     startGame();
}

function incrementAcceleration() {
     if (gameplayAcceleration <= 30) return;
     gameplayAcceleration /= 1.14;
}

function initializeGame() {
     objectPoolArray = tetrominoObjectPool();
     activeTetrominos = activeTetrominoPool();
     particlesPool = particlesObjectPool();
     drawMainBoard();
     emptyBoardData = copyImageData();
     drawHud();
     drawScore(0);
     drawLevel(1);
     drawMana();
     mainBoardData = copyImageData();
     assembleTetrominos();
     grid = createGrid();
     nextTetromino = Randomize(tetrominosArray);
     tetromino = Randomize(tetrominosArray);
}

async function gameEngine() {
     if (!isCollision) return movePhase();
     tetrominoId = initiateId();
     updateGrid();
     initiateTetrominoInfo();
     clearHud();
     filterRowsData = filterRows();
     tetromino.defaultCoordinates();
     tetromino = nextTetromino;
     nextTetromino = randomTetromino();
     drawHud();
     drawNextTetromino();

     !filterRowsData
          ? (playCollide(), collisionPhase())
          : (playClear(), await clearPhase())

     await specialsPhase()

     variableGoalSystem > (level * 5)
          ? (playLevelUp(), level++, incrementAcceleration())
          : null;

     drawLevel(level);
     drawScore(score);
     drawMana(manaLevel);

     manaLevel >= 100
          ? manaLevel = 0
          : null;

     isCollision = false;
     clearRowsMultiplier = 1;

     if (gameoverCheck()) return gameOver();
}

export async function clearPhase() {
     pauseGame();
     clearRowsMultiplier = filterRowsData.length;
     variableGoalSystem += calculateLevel(clearRowsMultiplier);
     score += calculateClearingScore(clearRowsMultiplier);
     manaLevel += clearRowsMultiplier;
     scoreBonus++;

     while (filterRowsData.length > 0) {
          const copiedActiveTetromino = structuredClone(activeTetrominos);
          const copiedActiveGrid = structuredClone(grid);

          await animateClears(filterRowsData, 'default');
          clearFilteredRows(filterRowsData);

          shiftFilteredRows(filterRowsData);
          shiftFilteredCols();
          checkForRedraws(filterRowsData[0], copiedActiveGrid)

          dropCellsData = prepareDropCells(copiedActiveTetromino)
          clearSet(collectDropCells);

          await drops(dropCellsData);

          filterRowsData = checkForClears();
     }

     clearMainBoard();
     pasteImageData(emptyBoardData);
     redrawTetrominos();
     mainBoardData = copyImageData();
     resumeGame();
}


function collisionPhase() {
     mainBoardData = copyImageData();
     clearMainBoard();
     pasteImageData(mainBoardData);
     drawTetromino();
     score += calculateCollisionScore();
     manaLevel += 1;
     scoreBonus = 10;
}

function movePhase() {
     clearMainBoard();
     pasteImageData(mainBoardData);
     drawTetromino();
}

async function specialsPhase() {
     const allSpecials = [startInvasion, startArtillery, startNinja, startRiots];

     (manaLevel === 25 || manaLevel === 75)
          ? Math.random() < 0.20
               ? (pauseGame(), await startNinja())
               : null
          : null

     // (manaLevel === 15 || manaLevel === 35 || manaLevel === 60 || manaLevel === 85)
     //      ? Math.random() < 0.15
     //           ? (pauseGame(), await startRiots())
     //           : null
     //      : null

     manaLevel === 50
          ? Math.random() < 0.99
               ? (pauseGame(), await startArtillery())
               : null
          : null

     manaLevel === 100
          ? (pauseGame(), await startRiots())
          : null
     //Randomize(allSpecials)()

     function startInvasion() {
          return new Promise(resolve => {
               invasionStrike((bonusScore) => {
                    clearMainBoard();
                    pasteImageData(emptyBoardData);
                    mainBoardData = copyImageData();
                    score += bonusScore;
                    drawScore(score);
                    resumeGame();
                    resolve();
               })
          })
     }

     function startRiots() {
          return new Promise(resolve => {
               riotStrike(() => {
                    resumeGame();
                    resolve();
               })
          })
     }

     function startArtillery() {
          return new Promise(resolve => {
               artilleryStrike((targetsAcquired, bonusScore) => {
                    if (targetsAcquired) {
                         clearMainBoard();
                         pasteImageData(emptyBoardData);
                         redrawTetrominos();
                         mainBoardData = copyImageData();
                         filterRowsData = filterRows();

                         filterRowsData
                              ? clearPhase()
                              : null

                         score += bonusScore;
                         drawScore(score);
                    }
                    resumeGame()
                    resolve();
               });
          })
     }

     function startNinja() {
          return new Promise(resolve => {
               ninjaStrike((targetsAcquired, bonusScore) => {
                    if (targetsAcquired) {
                         clearMainBoard();
                         pasteImageData(emptyBoardData);
                         redrawTetrominos();
                         mainBoardData = copyImageData();
                         filterRowsData = filterRows();

                         filterRowsData
                              ? clearPhase()
                              : null

                         score += bonusScore;
                         drawScore(score);
                    }
                    resumeGame();
                    resolve();
               })
          })
     }
}



window.onkeydown = (key) => {
     if (pause) return;

     switch (key.code) {
          case 'ArrowDown':
               tetromino.moveDown();
               resetGameplayInterval();
               break;
          case 'ArrowLeft':
               tetromino.moveLeft();
               break;
          case 'ArrowRight':
               tetromino.moveRight();
               break;
          case 'ArrowUp':
               rotation();
               break;
          case 'Escape':
               pauseEntireGame();
          default:
               break;
     }
     gameEngine()
}

window.addEventListener('mousemove', (e) => {
     if (pause) return;

     const currentMouseX = e.offsetX;
     const currentMouseY = e.offsetY;
     const deltaX = currentMouseX - previousMouseX;
     const deltaY = currentMouseY - previousMouseY;

     if (Math.abs(deltaX) > 20) {
          deltaX > 0
               ? tetromino.moveRight()
               : tetromino.moveLeft();

          previousMouseX = currentMouseX;
          gameEngine();
     }

     if (deltaY > 20) {
          tetromino.moveDown();
          previousMouseY = currentMouseY;
          resetGameplayInterval();
          gameEngine();
     }
});

window.addEventListener('click', (e) => {
     e.preventDefault();
     if (window.innerWidth < 720) return;
     rotation();
     gameEngine();
     resetGameplayInterval();
})

window.history.pushState({ page: "game" }, "", "");

window.addEventListener('popstate', (event) => {
     if (event.state && event.state.page === "game") {
          pauseEntireGame();
          window.history.pushState({ page: "game" }, "", "");
     }
});

function handleInteraction() {
     if (pause) return;
     rotation();
     gameEngine();
}

window.addEventListener('touchstart', (e) => {
     if (pause) return;
     touchStartX = e.touches[0].clientX;
     touchStartY = e.touches[0].clientY;
     isDragging = false;
});

window.addEventListener('touchmove', (e) => {
     if (pause) return;

     const currentTouchX = e.touches[0].clientX;
     const currentTouchY = e.touches[0].clientY;
     const deltaX = currentTouchX - touchStartX;
     const deltaY = currentTouchY - touchStartY;

     if (Math.abs(deltaX) > 30) {
          deltaX > 0
               ? tetromino.moveRight()
               : tetromino.moveLeft();

          touchStartX = currentTouchX;
          isDragging = true;
          gameEngine();
     } else if (Math.abs(deltaY) > 30) {
          tetromino.moveDown();
          touchStartY = currentTouchY;
          isDragging = true;
          resetGameplayInterval();
          gameEngine();
     }
});

window.addEventListener('touchend', (e) => {
     if (pause) return;

     if (!isDragging) {
          handleInteraction();
     }
});



playGameButton.onclick = () => {
     menuOpened = false;
     gameStarted = true;
     pause = false;
     playMainTheme();
     mainMenu.style.display = 'none';
     startGame();
}

resumeBtn.onclick = () => {
     menuOpened = false;
     mainMenu.style.display = 'none'
     resumeGame();
     resumeCurrentTheme();
}

restartBtn.onclick = () => {
     pause = false;
     menuOpened = false;
     mainMenu.style.display = 'none'
     descriptionTxt.classList.replace('hide', 'show');
     gameoverTxt.classList.replace('show', 'hide');
     homeAndRestart();
     playMainTheme();
     startGame();
}

function startGame() {
     if (pause) return;

     clearInterval(gameplayStatus);

     gameplayStatus = setInterval(() => {
          tetromino.moveDown();
          gameEngine();
     }, gameplayAcceleration);
}

function pauseGame() {
     pause = true;
     clearInterval(gameplayStatus)
}

function resumeGame() {
     pause = false;
     startGame();
}

function pauseEntireGame() {
     if (gameStarted && !menuOpened) {
          pauseCurrentTheme();
          pauseGame();
          menuOpened = true;
          mainMenu.style.display = 'flex'
          resumeBtn.classList.replace('hide', 'show');
          restartBtn.classList.replace('hide', 'show');
          startBtn.classList.replace('show', 'hide');
     }
}

function gameOver() {
     stopMainTheme();
     stopSovietTheme();
     playGameOver();
     pauseGame();
     pauseCurrentTheme();
     menuOpened = true;
     mainMenu.style.display = 'flex'
     resumeBtn.classList.replace('show', 'hide');
     restartBtn.classList.replace('hide', 'show');
     startBtn.classList.replace('show', 'hide');
     descriptionTxt.classList.replace('show', 'hide');
     gameoverTxt.classList.replace('hide', 'show');
}

function homeAndRestart() {
     clearMainBoard();
     clearHud();
     clearSpecial();
     drawMainBoard();
     mainBoardData = copyImageData();
     grid = createGrid();
     drawHud();
     drawScore(0);
     drawLevel(1);
     drawMana();
     tetromino.defaultCoordinates();
     tetromino = nextTetromino;
     nextTetromino = randomTetromino();
     drawNextTetromino();
     objectPoolArray = tetrominoObjectPool();
     activeTetrominos = activeTetrominoPool();
     particlesPool = particlesObjectPool();
     tetrominoId = 0;
     isCollision = false;
     targetRow = 0;
     clearRowsMultiplier = 1;
     scoreBonus = 10;
     variableGoalSystem = 0;
     score = 0;
     level = 1;
     manaLevel = 0;
     gameplayAcceleration = 1000;
     stopMainTheme();
     stopSovietTheme();
}