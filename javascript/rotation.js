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

     let offsetX;
     rotate();

     const collisionDetected = tetromino.cells.some(cell =>
          cell.x < 0 ||
          cell.x >= COLS ||
          grid[cell.y][cell.x] !== 0
     );

     if (!collisionDetected) return;

     const collisionDirection = tetromino.cells.every(cell => {

          if (cell.x > 0 && grid[cell.y][cell.x - 1] === 0) {
               offsetX = -1;
               return true;
          }

          if (cell.x < COLS - 1 && grid[cell.y][cell.x + 1] === 0) {
               offsetX = +1;
               return true;
          }

          return false;
     });

     if (collisionDirection) {
          tetromino.cells.forEach(cell => cell.x += offsetX);
          return;
     }

     rotate();
}
