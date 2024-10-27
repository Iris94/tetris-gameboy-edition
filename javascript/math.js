import { Tetrominos, tetromino, boardMatrix } from "./board.js";
import { CellWidth, CellHeight, Cols, Rows } from "./config.js";

export const randomTetromino = () =>
     Tetrominos[Math.floor(Math.random() * Tetrominos.length)];

export const minmaxNumber = (max, target) =>
     Math.min(max, Math.max(0, target))

export const maxRow = () => Rows - 1;
export const maxCol = () => Cols - 1;

export function tetrominoLoop(callback) {

     const loop = [];

     for (let i = 0; i < tetromino.cells.length; i++) {
          let pixelX = tetromino.cells[i].pixelX;
          let pixelY = tetromino.cells[i].pixelY;
          let gridX = minmaxNumber(maxCol(), Math.round(pixelX / CellWidth));
          let gridY = minmaxNumber(maxRow(), Math.round(pixelY / CellHeight));
          let color = tetromino.color;

          const cellData = { pixelX, pixelY, gridX, gridY, color };
          loop.push(cellData);

          if (callback) {
               callback(pixelX, pixelY, gridX, gridY, color)
          }
     }

     return loop;
}

export function boardLoop(callback) {
     for (let row = 0; row < boardMatrix.length; row++) {
          for (let col = 0; col < boardMatrix[row].length; col++) {

               const cell = boardMatrix[row][col];

               if (callback) {
                    callback(cell, row, col);
               }

          }
     }
}

export function rotateCells(callback) {
     const centerX = tetromino.cells[2].pixelX;
     const centerY = tetromino.cells[2].pixelY;

     tetromino.cells.forEach(cell => {
          const dx = cell.pixelX - centerX;
          const dy = cell.pixelY - centerY;

          cell.pixelX = centerX - dy;
          cell.pixelY = centerY + dx;

          if (callback) {
               callback(cell);
          }
     });
}

