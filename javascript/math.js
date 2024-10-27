import { Tetrominos, tetromino, boardMatrix} from "./board.js";
import { CellWidth, CellHeight, Cols, Rows } from "./config.js";

export const randomTetromino = () =>
Tetrominos[Math.floor(Math.random() * Tetrominos.length)];

export const minmaxNumber = (max, target) => 
Math.min(max, Math.max(0, target))

export const maxRow = () => Rows- 1;
export const maxCol = () => Cols - 1;

export function tetrominoLoop(callback) {

     const loop = [];

     for (let i = 0; i < tetromino.cells.length; i++) {
          let pixelX = tetromino.cells[i].x;
          let pixelY = tetromino.cells[i].y;
          let gridX = minmaxNumber(maxCol(), Math.round(pixelX / CellWidth));
          let gridY = minmaxNumber(maxRow(), Math.round(pixelY / CellHeight));
          let color = tetromino.color;

          const cellData =  {pixelX, pixelY, gridX, gridY, color };
          loop.push(cellData);

          if (callback) {
               callback(pixelX, pixelY, gridX, gridY, color)
          }
     }

     return loop;
}

export function boardLoop (callback) {
     for (let row = 0; row < boardMatrix.length; row++) {
          for (let col = 0; col < boardMatrix[row].length; col++) {

               const cell = boardMatrix[row][col];

               if (callback) {
                    callback(cell, row, col);
               }

          }
     }
}

