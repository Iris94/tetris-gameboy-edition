import { Cols, Rows } from "./config.js";
import { grid, tetromino } from "./engine.js";

export function shadowRotation(data) {
     while (data.every(cell => cell.y + 1 < Rows && grid[cell.y + 1][cell.x] === 0)) {
          data.forEach(cell => cell.y += 1);
     }

}

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
     const originals = structuredClone(tetromino.cells);

     rotate();

     let collisionDetected = tetromino.cells.some(cell => grid[cell.y]?.[cell.x] !== 0);
     const wallkickData = [-1, +1];

     for (let i = 0; i < 4; i++) {
          if (!collisionDetected) break;

          for (let kick of wallkickData) {
               tetromino.cells.forEach(cell => cell.x += kick);
               collisionDetected = tetromino.cells.some(cell => grid[cell.y]?.[cell.x] !== 0);

               if (!collisionDetected) break;
               tetromino.cells.forEach(cell => cell.x -= kick);
          }

          if (collisionDetected) rotate();
     }

     if (collisionDetected) tetromino.cells = originals;
}
