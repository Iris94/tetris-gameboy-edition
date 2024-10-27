export const canvas = document.querySelector('#canvas');
export const ctx = canvas.getContext('2d');

import { CellWidth, CellHeight, Rows, Cols, collisionDetected, setCollisionDetected, leftWallDetected, rightWallDetected } from "./config.js";
import { iCells, jCells, lCells, tCells, sCells, zCells, oCells } from "./tetrominos.js";
import { clearCanvas, drawBoard, drawTetromino, fillMatrix } from "./logic.js";
import { randomTetromino} from "./math.js";
import { collision } from "./collision.js";
import { rotation } from "./rotation.js";

export let boardMatrix = Array.from({ length: Rows }, () => Array(Cols).fill(null));
export let tetromino;

class Tetromino {
     constructor(cells, color, name, savedCells) {
          this.cells = cells;
          this.color = color;
          this.name = name;
          this.savedCells = savedCells || JSON.parse(JSON.stringify(cells));
     }

     moveLeft() {
          this.cells.forEach(cell => {
               cell.pixelX -= CellWidth;
          })
     }

     moveRight() {
          this.cells.forEach(cell => {
               cell.pixelX += CellWidth;
          })
     }

     moveDown() {
          this.cells.forEach(cell => {
               cell.pixelY += CellHeight;
          })
     }

     defaultCoordinates() {
          this.cells = JSON.parse(JSON.stringify(this.savedCells));
     }
}

const I = new Tetromino(iCells, '#00aec3', 'I');
const J = new Tetromino(jCells, '#007fcd', 'J');
const L = new Tetromino(lCells, '#d49600', 'L');
const O = new Tetromino(oCells, '#beae00', 'O');
const S = new Tetromino(sCells, '#37cd00', 'S');
const T = new Tetromino(tCells, '#9300cd', 'T');
const Z = new Tetromino(zCells, '#cd0a00', 'Z');

export const Tetrominos = [I, J, L, O, S, T, Z];

tetromino = randomTetromino();

export function gameEngine () {
     
     collision();

     if (!collisionDetected) {
          clearCanvas();
          drawBoard();
          drawTetromino();
          return;
     }

     fillMatrix();
     tetromino.defaultCoordinates();
     clearCanvas();
     tetromino = randomTetromino();
     drawBoard();
     setCollisionDetected(false)
}

drawBoard();
drawTetromino();
gameEngine();

window.onkeydown = function (e) {

     if (e.keyCode == 37 && !leftWallDetected) {
          tetromino.moveLeft();
          gameEngine();
     }

     if (e.keyCode == 39 && !rightWallDetected) {
          tetromino.moveRight();
          gameEngine();
     }

     if (e.keyCode == 40) {
          tetromino.moveDown();
          gameEngine();
     }

     if (e.keyCode == 38) {
          rotation();
          gameEngine();
     }
};










