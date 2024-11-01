import { COLS, ROWS, CTX, DX, DY } from "./config.js";

export function createGrid () {
     return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

export function drawGrid () {

     CTX.strokeStyle = 'rgba(255, 255, 255, 0.1)';
     CTX.lineWidth = 1

     for (let row = 0; row < ROWS; row++) {
          for (let col = 0; col < COLS; col++) {

               const x = col * DX;
               const y = row * DY;

               CTX.strokeRect(x, y, DX, DY)
          }
     }
}
