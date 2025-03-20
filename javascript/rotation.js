import { Rows } from "./config.js";
import { grid, tetromino } from "./engine.js";

export function shadowRotation(data) {
     while (data.cells.every(cell => cell.y + 1 < Rows && grid[cell.y + 1]?.[cell.x] === 0)) {
          data.cells.forEach(cell => cell.y += 1);
     }

     if (data.name === 'O') return;
     let threshold = 0;
     let overrideCells = null;

     const calculateData = (data) => {
          let calculation = 0;
          for (let cell of data.cells) {
               grid[cell.y + 1]?.[cell.x] !== 0 && calculation++;
               grid[cell.y - 1]?.[cell.x] !== 0 && calculation++;
               grid[cell.y]?.[cell.x + 1] !== 0 && calculation++;
               grid[cell.y]?.[cell.x - 1] !== 0 && calculation++;
          }
          return calculation;
     };

     threshold = calculateData(data);

     const collisionDetected = (data) => data.cells.some(cell => grid[cell.y]?.[cell.x] !== 0);
     const wallkickData = [-1, +1];
     let host = structuredClone(data);

     for (let h = 0; h < 4; h++) {
          for (let i = 0; i < 4; i++) {
               let rotationData = 0;
               let shadowCopy = structuredClone(host);

               for (let j = 0; j < i; j++) {
                    rotate(shadowCopy);
               }

               while (shadowCopy.cells.every(cell => cell.y + 1 < Rows && grid[cell.y + 1]?.[cell.x] === 0)) {
                    shadowCopy.cells.forEach(cell => cell.y += 1);
               }

               if (!collisionDetected(shadowCopy)) {
                    rotationData = calculateData(shadowCopy);

                    if (rotationData <= threshold) continue;
                    threshold = rotationData;
                    overrideCells = shadowCopy.cells;
               } else {
                    for (let kick of wallkickData) {
                         shadowCopy.cells.forEach(cell => cell.x += kick);

                         if (!collisionDetected(shadowCopy)) {
                              rotationData = calculateData(shadowCopy);

                              if (rotationData <= threshold) continue;
                              threshold = rotationData;
                              overrideCells = shadowCopy.cells;
                              break;
                         }
                         shadowCopy.cells.forEach(cell => cell.x -= kick);
                    }
               }
          }
          if (h < 3) rotate(host);
     }

     if (overrideCells) data.cells = overrideCells;
}

function rotate(data) {
     data.cells.forEach(cell => {
          let dx = cell.x - data.cells[2].x;
          let dy = cell.y - data.cells[2].y;
          cell.x = data.cells[2].x - dy;
          cell.y = data.cells[2].y + dx;
     });
}

export function rotation() {
     if (tetromino.name === 'O') return;
     const originals = structuredClone(tetromino.cells);

     rotate(tetromino);

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
