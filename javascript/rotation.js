import { Cols, Rows } from "./config.js";
import { grid, tetromino } from "./engine.js";

function rotate() {
     tetromino.cells.forEach(cell => {
          let dx = cell.x - tetromino.cells[2].x;
          let dy = cell.y - tetromino.cells[2].y;
          cell.x = tetromino.cells[2].x - dy;
          cell.y = tetromino.cells[2].y + dx;
     });
}

function wallkicks(data) {
     for (let kick of data) {
          const collisionDetected = tetromino.cells.some(cell =>
               cell.x < 0 ||
               cell.x >= Cols ||
               grid[cell.y][cell.x] !== 0
          );

          if (!collisionDetected) {
               return true;
          }

          tetromino.cells.forEach(cell => cell.x += kick);
     }
     return false;
}

export function rotation() {
     if (tetromino.name === 'O') return;

     let wallkickData = [-1, +2, -1];

     rotate();

     const outOfBounds = tetromino.cells.some(cell => cell.y >= Rows);
     if (outOfBounds) {
          rotate();
          return;
     }

     const outOfBoundsTop = tetromino.cells.some(cell => cell.y < 0);
     if (outOfBoundsTop) {
          rotate();
          return; 
     }

     if (wallkicks(wallkickData)) return;

     rotate();
     wallkicks(wallkickData);
}
