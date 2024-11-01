import { drawGrid, createGrid } from "./initialize.js";
import { clearGridData, drawTetromino, getGridData, putGridData, randomize, updateGrid } from "./logic.js";
import { tetrominoShapes } from "./tetrominos.js";
import { ROWS, COLS } from "./config.js";
import { rotation } from "./rotation.js";

export let grid;
export let gridData;
export let tetrominosArray = [];
export let collision = false;
export let tetromino;

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
               grid[cell.y + 1][cell.x] === 1)) 
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
               grid[cell.y][cell.x - 1] === 1)) {
               return;
          }
          this.cells.forEach(cell => cell.x -= 1);
     }

     moveRight() {
          if (this.cells.some(cell =>

               cell.x === COLS - 1 ||
               grid[cell.y][cell.x + 1] === 1)) {
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

function assembleTetrominos() {
     for (let shape of tetrominoShapes) {
          for (let cell of shape.cells) {

               cell.x += 4;

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
     gridData = getGridData();
     assembleTetrominos();
     grid = createGrid();
     tetromino = tetrominosArray[2];
     tetrisLoop();
}

function tetrisLoop () {
     gameEngine();
     requestAnimationFrame(tetrisLoop);
}

function gameEngine() {
     if (collision) {
          gridData = getGridData();
          updateGrid();
          tetromino.defaultCoordinates();
          tetromino = randomize(tetrominosArray);
     }
    
     clearGridData();
     putGridData(gridData);
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
     









