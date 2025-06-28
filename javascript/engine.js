import { drawMainBoard, drawTetromino, redrawTetrominos, drawHud, drawNextTetromino, drawScore, drawLevel, drawMana } from "./draws.js";
import { clearMainBoard, clearHud, clearFilteredRows, filterRows, copyImageData, pasteImageData, updateGrid, shiftFilteredCols, initiateId, initiateTetrominoInfo, shiftFilteredRows, checkForClears, clearSpecial, reconstructGrid, prepareDropCells, collectBlocks, clearShadows, clearMana } from "./updates.js";
import { tetrominoShapes } from "./tetrominos.js";
import { Cols, createGrid, Randomize, Position, tetrominoObjectPool, activeTetrominoPool, particlesObjectPool, playGameButton, startBtn, restartBtn, resumeBtn, descriptionTxt, gameoverTxt, End } from "./config.js";
import { rotation, shadowRotation } from "./rotation.js";
import { calculateClearingScore, calculateCollisionScore, calculateLevel, randomTetromino } from "./metrics.js";
import { ninjaStrike } from "./animations/ninjaStrike.js";
import { drops } from "./animations/drops.js";
import { animateClears } from "./animations/clears.js";
import { artilleryStrike } from "./animations/artilleryStrike.js";
import { invasionStrike } from "./animations/invasionStrike.js";
import { pauseCurrentTheme, playClear, playCollide, playGameOver, playLevelUp, playMainTheme, resumeCurrentTheme, stopMainTheme, stopSovietTheme } from './sound.js';
import { riotStrike } from "./animations/riotStrike.js";
import { shadowPush } from "./animations/shadowPush.js";

export let grid = [];
export let tetrominoObjects = [];
export let objectPoolArray;
export let particlesPool;
export let reuseObjectIdArray = [];
export let tetrominoId = 0;
export let mainBoardData;
export let emptyBoardData;
export let clearBoardData;
export let shadowFlag = false;
export let tetrominosArray = [];
export let filterRowsData = [];
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
     constructor(name, color, ghostColor, cells) {
          this.name = name;
          this.color = color;
          this.ghostColor = ghostColor;
          this.cells = cells;
          this.shadowSwitch = false;
          this.positionZero = structuredClone(cells);
          this.shadow = { cells: structuredClone(cells), color: ghostColor, name };
     }

     async shadowMove() {
          pauseGame();
          shadowFlag = await shadowPush();
          isCollision = true;
          resumeGame();
     }

     calculateRotation() {
          this.shadowSwitch = false;
          rotation();
          tetromino.calculateShadow();
     }

     calculateShadow() {
          this.shadow.cells = structuredClone(this.cells);
          shadowRotation(this.shadow);
     }

     moveDown() {
          const initializeMovement = !this.cells.some(cell => cell.y === End || grid[cell.y + 1][cell.x] !== 0);
          initializeMovement
               ? this.cells.forEach(cell => cell.y += 1)
               : isCollision = true;
     }

     moveLeft() {
          const initializeMovement = this.cells.some(cell => cell.x === 0 || grid[cell.y][cell.x - 1] !== 0);
          if (initializeMovement) return;

          this.cells.forEach(cell => cell.x -= 1);
          this.shadowSwitch = true;
          tetromino.calculateShadow();
     }

     moveRight() {
          const initializeMovement = this.cells.some(cell => cell.x === Cols - 1 || grid[cell.y][cell.x + 1] !== 0);
          if (initializeMovement) return;

          this.cells.forEach(cell => cell.x += 1);
          this.shadowSwitch = true;
          tetromino.calculateShadow();
     }

     defaultCoordinates() {
          this.cells = structuredClone(this.positionZero);
     }
}

initializeGame();
drawNextTetromino();

function assembleTetrominos() {
     tetrominoShapes.forEach(shape => {
          shape.cells.forEach(cell => cell.x += Position);
          tetrominosArray.push(new Tetromino(
               shape.name, shape.color, shape.ghostColor, shape.cells
          ));
     });
}

function resetGameplayInterval() {
     gameplayStatus && clearInterval(gameplayStatus);
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

     tetrominoId = initiateId();
     updateGrid() && gameOver();
     initiateTetrominoInfo();
     shadowFlag && redrawTetrominos();

     clearShadows();
     pauseGame();
     clearHud();
     filterRowsData = filterRows();
     tetromino.defaultCoordinates();
     tetromino = nextTetromino;
     tetromino.calculateShadow();
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

     manaLevel >= 100 && (manaLevel = 0);
     drawLevel(level);
     drawScore(score);
     drawMana(manaLevel);

     clearRowsMultiplier = 1;
     isCollision = false;
     shadowFlag = false;
     mainBoardData = copyImageData();
     drawTetromino();
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
}

async function specialsPhase() {
     const allSpecials = [startInvasion, startArtillery, startNinja, startRiots];

     if ((manaLevel === 25 || manaLevel === 75) && Math.random() < 0.25)
          Math.random() < 0.50 ? await startRiots() : await startNinja();

     manaLevel === 50
          && Math.random() < 0.25
          && await startArtillery();

     manaLevel >= 100
          && await startInvasion();
          //await Randomize(allSpecials)();

     async function startInvasion() {
          bonusScore = await invasionStrike();
          score += bonusScore;
          drawScore(score);
     }

     async function startRiots() {
          bonusScore = await riotStrike();
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

document.addEventListener('keydown', async event => {
     if (pause) return;
     if (event.repeat && !['ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.code)) return;

     switch (event.code) {
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
               tetromino.calculateRotation();
               break;
          case 'Space':
               await tetromino.shadowMove();
               break;
          case 'Escape':
               pauseEntireGame();
               break;
          default:
               break;
     }

     gameEngine();
});

window.addEventListener('mousemove', e => {
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
     clearMana();
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