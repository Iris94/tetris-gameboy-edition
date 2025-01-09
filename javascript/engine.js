import { drawMainBoard, drawTetromino, redrawTetrominos, drawHud, drawNextTetromino, drawScore, drawLevel, drawMana, drawSpecialTetra, drawSpecialNinja, drawSpecialArtillery } from "./draws.js";
import { clearMainBoard, clearHud, clearFilteredRows, filterRows, copyImageData, pasteImageData, updateGrid, updateGridWithFilteredRows, initiateId, updateTetrominoInfoByRow, initiateTetrominoInfo, shiftFilteredRows, recheckRowState, delay, deepCopy, gameoverCheck } from "./updates.js";
import { tetrominoShapes } from "./tetrominos.js";
import { Rows, Cols, createGrid, Randomize, Position, tetrominoObjectPool, activeTetrominoPool, particlesObjectPool, playGameButton } from "./config.js";
import { rotation } from "./rotation.js";
import { calculateClearingScore, calculateCollisionScore, calculateLevel, randomTetromino } from "./metrics.js";
import { ninjaStrike } from "./animations/ninjaStrike.js";
import { drops } from "./animations/drops.js";
import { animateClears } from "./animations/clears.js";
import { artilleryStrike } from "./animations/artilleryStrike.js";
import { invasionStrike } from "./animations/invasionStrike.js";
import { playClear, playCollide, playDrop, playGameOver, playLevelUp, playMainTheme, stopSovietTheme } from './sound.js';
import { mainMenu } from "./menu.js";

export let grid;
export let copiedActiveTetromino;
export let idColorStorage;
export let activeTetrominos;
export let objectPoolArray;
export let particlesPool;
export let reuseObjectIdArray = [];
export let tetrominoId = 0;
export let mainBoardData;
export let emptyBoardData;
export let clearBoardData;
export let tetrominosArray = [];
export let isCollision = false;
export let filterRowsData = [];
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
drawTetromino();
drawNextTetromino();

playGameButton.onclick = () => { 
     menuOpened = false;
     gameStarted = true;
     pause = false;
     playMainTheme();
     mainMenu.style.display = 'none';
     startGame();
}

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

function resetGameplayInterval() {
     if (gameplayStatus) clearInterval(gameplayStatus);
     startGame();
}

function gameOver() {
     stopMainTheme();
     stopSovietTheme();
     playGameOver();
     pauseGame();
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
     drawSpecialNinja();
     drawSpecialArtillery();
     drawSpecialTetra();
     mainBoardData = copyImageData();
     assembleTetrominos();
     grid = createGrid();
     nextTetromino = Randomize(tetrominosArray);
     tetromino = Randomize(tetrominosArray);
}

function gameEngine() {
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
          ? (
               playCollide(),
               collisionPhase() )
          : (
               playClear(),
               clearPhase() 
          )

     specialsPhase()

     variableGoalSystem > (level * 5)
          ? (
               playLevelUp(),
               level++, incrementAcceleration()
               )
          : null;

     drawLevel(level);
     drawScore(score);
     drawMana(manaLevel);

     manaLevel === 100 ? manaLevel = 0 : null;

     isCollision = false;
     clearRowsMultiplier = 1;

     if (gameoverCheck()) return gameOver();
}

async function clearPhase() {
     pauseGame();
     while (filterRowsData.length > 0) {
          targetRow = filterRowsData[filterRowsData.length - 1];
          idColorStorage = updateTetrominoInfoByRow(filterRowsData);
          copiedActiveTetromino = deepCopy(activeTetrominos)

          animateClears(filterRowsData, 'default');
          await delay(50);

          clearFilteredRows(filterRowsData);

          shiftFilteredRows(filterRowsData);
          updateGridWithFilteredRows();

          await drops(targetRow, copiedActiveTetromino);

          filterRowsData = recheckRowState();
     }

     clearMainBoard();
     pasteImageData(emptyBoardData)
     redrawTetrominos();

     clearRowsMultiplier = filterRowsData.length;
     variableGoalSystem += calculateLevel(clearRowsMultiplier);
     score += calculateClearingScore(clearRowsMultiplier);
     manaLevel += clearRowsMultiplier;
     scoreBonus++;
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

function specialsPhase() {
     const allSpecials = [startInvasion, startArtillery, startNinja];

     (manaLevel === 25 || manaLevel === 75)
          ? Math.random() < 0.20
               ? (pauseGame(), startNinja())
               : null
          : null

     manaLevel === 50
          ? Math.random() < 0.20
               ? (pauseGame(), startArtillery())
               : null
          : null

     manaLevel === 100
          ? (pauseGame(), Randomize(allSpecials)())
          : null

     function startInvasion() {
          invasionStrike((bonusScore) => {
               clearMainBoard();
               pasteImageData(emptyBoardData);
               mainBoardData = copyImageData();
               score += bonusScore;
               drawScore(score);
               resumeGame();
          })
     }

     function startArtillery() {
          artilleryStrike((targetsAcquired, bonusScore) => {
               if (targetsAcquired) {
                    clearMainBoard();
                    pasteImageData(emptyBoardData);
                    redrawTetrominos();
                    mainBoardData = copyImageData();
                    filterRowsData = filterRows();
                    if (filterRowsData) {
                         clearPhase();
                    }
                    score += bonusScore;
                    drawScore(score);
               }
               resumeGame()
          });
     }

     function startNinja() {
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

function handleInteraction(e) {
    if (pause) return;
    e.preventDefault();
    rotation();
    gameEngine();
}

window.addEventListener('click', handleInteraction);
window.addEventListener('touchstart', handleInteraction);

window.addEventListener('touchmove', (e) => {
     if (pause) return;

     const currentTouchX = e.touches[0].clientX;
     const currentTouchY = e.touches[0].clientY;
     const deltaX = currentTouchX - previousTouchX;
     const deltaY = currentTouchY - previousTouchY;

     if (Math.abs(deltaX) > 30) {
          deltaX > 0
               ? tetromino.moveRight()
               : tetromino.moveLeft();

          previousTouchX = currentTouchX;
          gameEngine();
     }

     if (Math.abs(deltaY) > 30) {
          tetromino.moveDown();
          previousTouchY = currentTouchY;
          resetGameplayInterval();
          gameEngine();
     }
});
