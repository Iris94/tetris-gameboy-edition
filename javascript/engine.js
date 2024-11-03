import { drawGrid, drawTetromino, redrawTetrominos, drawNextGrid, drawNextTetromino } from "./draws.js";
import { clearGridState, clearNextGridState, clearRow, copyGridState, pasteGridState, updateGrid } from "./updates.js";
import { tetrominoShapes } from "./tetrominos.js";
import { ROWS, COLS, STRING_EMPTY, createGrid, Randomize, POSITION } from "./config.js";
import { rotation } from "./rotation.js";

export let grid;
export let gridData;
export let tetrominosArray = [];
export let collision = false;
export let tetromino;
export let nextTetromino;

export class Tetromino {
     constructor(name, color, cells, positionZero) {
          this.name = name;
          this.color = color;
          this.cells = cells;
          this.positionZero = positionZero || JSON.parse(JSON.stringify(cells));
     }

     moveDown() {
          if (this.cells.some(cell =>
               cell.y === ROWS - 1 ||
               grid[cell.y + 1][cell.x] !== STRING_EMPTY)) 
          {
               collision = true;
          } 
          else 
          {
               this.cells.forEach(cell => cell.y += 1);
          }
     }

     moveLeft() {
          if (this.cells.some(cell =>

               cell.x === 0 ||
               grid[cell.y][cell.x - 1] !== STRING_EMPTY)) {
               return;
          }
          this.cells.forEach(cell => cell.x -= 1);
     }

     moveRight() {
          if (this.cells.some(cell =>

               cell.x === COLS - 1 ||
               grid[cell.y][cell.x + 1] !== STRING_EMPTY)) {
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

               cell.x += POSITION;
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
     drawGrid();
     drawNextGrid();
     gridData = copyGridState();
     assembleTetrominos();
     grid = createGrid();
     nextTetromino = Randomize(tetrominosArray);
     tetromino = Randomize(tetrominosArray);
     tetrisLoop();
}

function tetrisLoop () {
     gameEngine();
     requestAnimationFrame(tetrisLoop);
}

function gameEngine() {
     if (collision) {
          updateGrid();
          clearNextGridState();
          tetromino = nextTetromino;
          nextTetromino = Randomize(tetrominosArray);
          drawNextGrid();
          drawNextTetromino();
          
          if (clearRow()) {
               drawGrid();
               redrawTetrominos();
               gridData = copyGridState();
               tetromino.defaultCoordinates();
               tetromino = nextTetromino;
               drawTetromino();
               collision = false;
               return;
          }

          gridData = copyGridState();
          tetromino.defaultCoordinates();
     }
     
     clearGridState();
     pasteGridState(gridData);
     drawTetromino();
     collision = false;
}


window.onkeydown = (key) => {

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
