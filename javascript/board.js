export const canvas = document.querySelector('#canvas');
export const ctx = canvas.getContext('2d');

canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

export const Rows = 20;
export const Cols = 10;
export const CellWidth = canvas.width / Cols;
export const CellHeight = canvas.height / Rows;
export const Y_Axis = canvas.height / Rows;
export const X_Axis = canvas.width / Cols;

import { iCells, jCells, lCells, tCells, sCells, zCells, oCells } from "./tetrominos.js";
import { clearCanvas, drawBoard, drawTetromino, fillMatrix, fillBoard } from "./updates.js";
import { randomTetromino} from "./math.js";
import { watchguard, leftStop, rightStop } from "./rules.js";
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
          this.cells.forEach((cell) => {
               cell.x -= X_Axis;
          })
     }

     moveRight() {
          this.cells.forEach((cell) => {
               cell.x += X_Axis;
          })
     }

     moveDown() {
          this.cells.forEach((cell) => {
               cell.y += Y_Axis;
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

export function updateBoard() {
     clearCanvas();
     drawBoard();
     fillBoard();
     drawTetromino();
}

export function nextTetromino() {
     fillMatrix();
     tetromino.defaultCoordinates();
     tetromino = randomTetromino();
}

drawBoard()
drawTetromino()

window.onkeydown = function (e) {

     if (e.keyCode == 37 && !leftStop) {
          tetromino.moveLeft();
          updateBoard();
          watchguard()
     }

     if (e.keyCode == 39 && !rightStop) {
          tetromino.moveRight();
          updateBoard();
          watchguard();
     }

     if (e.keyCode == 40) {
          tetromino.moveDown();
          updateBoard();
          watchguard();
     }

     if (e.keyCode == 38) {
          rotation();
          updateBoard();
          watchguard();
     }
};










