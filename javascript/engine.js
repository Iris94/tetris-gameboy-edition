import { drawMainBoard, drawTetromino, redrawTetrominos, drawHud, drawNextTetromino, drawScore, drawLevel, drawMana } from "./draws.js";
import { clearMainBoard, clearHud, clearFilteredRows, filterRows, copyImageData, pasteImageData, updateGrid, shiftFilteredCols, initiateId, initiateTetrominoInfo, shiftFilteredRows, checkForClears, gameoverCheck, clearSpecial, reconstructGrid, prepareDropCells, collectBlocks, clearShadows } from "./updates.js";
import { tetrominoShapes } from "./tetrominos.js";
import { Rows, Cols, createGrid, Randomize, Position, tetrominoObjectPool, activeTetrominoPool, particlesObjectPool, playGameButton, startBtn, restartBtn, resumeBtn, descriptionTxt, gameoverTxt, End } from "./config.js";
import { rotation, shadowRotation } from "./rotation.js";
import { calculateClearingScore, calculateCollisionScore, calculateLevel, randomTetromino } from "./metrics.js";
import { ninjaStrike } from "./animations/ninjaStrike.js";
import { drops } from "./animations/drops.js";
import { animateClears } from "./animations/clears.js";
import { artilleryStrike } from "./animations/artilleryStrike.js";
import { invasionStrike } from "./animations/invasionStrike.js";
import { pauseCurrentTheme, playClear, playCollide, playGameOver, playLevelUp, playMainTheme, resumeCurrentTheme, stopMainTheme, stopSovietTheme } from './sound.js';
import { riotStrike } from "./animations/riotStrike.js";

export let grid = [];
export let tetrominoObjects = [];
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
export let bonusScore = 0;
export let variableGoalSystem = 0;
export let tetromino;
export let nextTetromino;
export let score = 0;
export let level = 1;
export let manaLevel = 0;
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
     constructor(name, color, ghostColor, cells) {
          this.name = name;
          this.color = color;
          this.ghostColor = ghostColor;
          this.cells = cells;
          this.positionZero = structuredClone(cells);
          this.shadow = { cells: structuredClone(cells), color: ghostColor, name };
     }

     calculateShadow() {
          this.shadow.cells = structuredClone(this.cells);
          this.shadow.cells.sort((a, b) => b.y - a.y);
          shadowRotation(this.shadow);
     }

     moveDown() {
          if (this.cells.some(cell =>
               cell.y === End ||
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
          tetromino.calculateShadow();
     }

     moveRight() {
          if (this.cells.some(cell =>

               cell.x === Cols - 1 ||
               grid[cell.y][cell.x + 1] !== 0)) {
               return;
          }

          this.cells.forEach(cell => cell.x += 1);
          tetromino.calculateShadow();
     }

     defaultCoordinates() {
          this.cells = structuredClone(this.positionZero);
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
                    shape.ghostColor,
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
     tetrominoObjects = activeTetrominoPool();
     particlesPool = particlesObjectPool();
     drawMainBoard();
     drawHud();
     drawScore(0);
     drawLevel(1);
     drawMana();
     mainBoardData = copyImageData();
     assembleTetrominos();
     grid = createGrid();
     nextTetromino = Randomize(tetrominosArray);
     tetromino = Randomize(tetrominosArray);
     drawTetromino();
     tetromino.calculateShadow();
}

async function gameEngine() {
     if (!isCollision) return movePhase();
     clearShadows();
     pauseGame();
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

     !filterRowsData ? collisionPhase() : await clearPhase();
     await specialsPhase()

     if (variableGoalSystem > (level * 5)) {
          playLevelUp();
          level++;
          incrementAcceleration();
     }

     if (manaLevel >= 100) manaLevel = 0;

     drawLevel(level);
     drawScore(score);
     drawMana(manaLevel);

     isCollision = false;
     clearRowsMultiplier = 1;
     mainBoardData = copyImageData();
     drawTetromino();

     if (gameoverCheck()) return gameOver();
     resumeGame();
}

export async function clearPhase() {
     playClear();
     clearRowsMultiplier = filterRowsData.length;
     variableGoalSystem += calculateLevel(clearRowsMultiplier);
     manaLevel += clearRowsMultiplier;
     scoreBonus++;

     while (filterRowsData.length > 0) {
          const copyTetrominoObjects = structuredClone(tetrominoObjects);
          const collectId = filterRowsData[0] - 1;

          animateClears(filterRowsData, 'default');

          clearFilteredRows(filterRowsData);
          const collectBlocksData = collectBlocks(collectId);
          shiftFilteredRows(filterRowsData[0]);
          shiftFilteredCols(collectBlocksData);

          const dropCellsData = prepareDropCells(copyTetrominoObjects, collectBlocksData)
          let copyGrid = structuredClone(grid);
          reconstructGrid(copyGrid, dropCellsData);
          redrawTetrominos(copyGrid);

          await drops(dropCellsData);

          score += calculateClearingScore(filterRowsData.length);
          drawScore(score);
          filterRowsData = checkForClears();
     }
}

function collisionPhase() {
     playCollide();
     score += calculateCollisionScore();
     manaLevel += 1;
     scoreBonus = 10;
}

function movePhase() {
     clearMainBoard();
     clearShadows();
     pasteImageData(mainBoardData);
     drawTetromino();
     tetromino.calculateShadow();
}

async function specialsPhase() {
     const allSpecials = [startInvasion, startArtillery, startNinja, startRiots];

     if ((manaLevel === 25 || manaLevel === 75) && Math.random() < 0.25)
          Math.random() < 0.50 ? await startRiots() : await startNinja();

     manaLevel === 50
          && Math.random() < 0.25
          && await startArtillery();

     manaLevel >= 100
          && await Randomize(allSpecials)();

     async function startInvasion() {
          bonusScore = await invasionStrike();
          score += bonusScore;
          drawScore(score);
     }

     async function startRiots() {
          await riotStrike();
          filterRowsData = filterRows();
          filterRowsData.length > 0 && clearPhase();
     }

     async function startArtillery() {
          await artilleryStrike();
          score += calculateClearingScore(4);
          drawScore(score);
          filterRowsData = filterRows();
          filterRowsData.length > 0 && clearPhase();
     }

     async function startNinja() {
          bonusScore = await ninjaStrike()
          score += bonusScore;
          drawScore(score);
          filterRowsData = filterRows();
          filterRowsData.length > 0 && clearPhase();
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
               tetromino.calculateShadow();
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
     tetrominoObjects = activeTetrominoPool();
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