import { drawMainBoard, drawTetromino, redrawTetrominos, drawHud, drawNextTetromino, drawScore, drawLevel, drawMana, drawSpecialTetra, drawSpecialNinja, drawSpecialArtillery } from "./draws.js";
import { clearMainBoard, clearHud, clearFilteredRows, filterRows, copyImageData, pasteImageData, updateGrid, updateGridWithFilteredRows, initiateId, updateTetrominoInfo, initiateTetrominoInfo, shiftFilteredRows, recheckRowState, delay, deepCopy } from "./updates.js";
import { tetrominoShapes } from "./tetrominos.js";
import { Rows, Cols, createGrid, Randomize, Position, tetrominoObjectPool, activeTetrominoPool, particlesObjectPool } from "./config.js";
import { rotation } from "./rotation.js";
import { calculateClearingScore, calculateCollisionScore, calculateLevel, randomTetromino } from "./metrics.js";
import { ninjaStrike } from "./animations/ninjaStrike.js";
import { drops } from "./animations/drops.js";
import { animateClears } from "./animations/clears.js";

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
export let manaLevel = 35;
export let pause = false;


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
     !filterRowsData ? collisionPhase() : clearPhase();

     variableGoalSystem > (level * 5) ? level++ : null;

     drawLevel(level);
     drawScore(score);
     drawMana(manaLevel);

     manaLevel > 100 ? manaLevel = 0 : null;

     isCollision = false;
     clearRowsMultiplier = 1;

     if (manaLevel > 50) {
          pause = true;
          ninjaStrike(() => pause = false)
          return;
     }
}

async function clearPhase() {
     while (filterRowsData.length > 0) {

          targetRow = filterRowsData[filterRowsData.length - 1];
          idColorStorage = updateTetrominoInfo();
          copiedActiveTetromino = deepCopy(activeTetrominos)

          animateClears();
          await delay(50);

          clearFilteredRows();

          shiftFilteredRows();
          updateGridWithFilteredRows();

          await drops(targetRow);

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

window.onkeydown = (key) => {
     if (pause) return;

     switch (key.code) {
          case 'ArrowDown':
               tetromino.moveDown();
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
