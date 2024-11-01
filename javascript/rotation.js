import { COLS } from "./config.js";
import { grid, tetromino } from "./engine.js";

function rotate() {
     tetromino.cells.forEach(cell => {
          let dx = cell.x - tetromino.cells[2].x;
          let dy = cell.y - tetromino.cells[2].y;
          cell.x = tetromino.cells[2].x - dy;
          cell.y = tetromino.cells[2].y + dx;
     });
}

export function rotation() {
     if (tetromino.name === 'O') return;

     let wallKickData = [-1, +2, -1]
     let rotate1 = false;

     rotate();

     for (let kick of wallKickData) {

          const collisionDetected = tetromino.cells.some(cell =>
               cell.x < 0 ||
               cell.x >= COLS ||
               grid[cell.y][cell.x] !== 0
          );

          if (!collisionDetected) {
               rotate1 = true;
               break;
          }

          tetromino.cells.forEach(cell => cell.x += kick);
     }

     if (rotate1) return;

     rotate();

     for (let kick of wallKickData) {

          const collisionDetected = tetromino.cells.some(cell =>
               cell.x < 0 ||
               cell.x >= COLS ||
               grid[cell.y][cell.x] !== 0
          );

          if (!collisionDetected) {
               rotate1 = true;
               break;
          }

          tetromino.cells.forEach(cell => cell.x += kick);
     }
}
