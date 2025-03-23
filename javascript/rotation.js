import { End } from "./config.js";
import { grid, tetromino } from "./engine.js";

export function shadowRotation(data) {
     while (data.cells.every(cell => cell.y + 1 <= End && grid[cell.y + 1]?.[cell.x] === 0)) {
          data.cells.forEach(cell => cell.y += 1);
     }

     if (data.name === 'O') return;
     let threshold = 0;
     let overrideCells = null;

     const calculateData = (data) => {
          let calculation = 0;
          for (let cell of data.cells) {
               grid[cell.y + 1]?.[cell.x] !== 0 && calculation++;

               let down = grid[cell.y - 1]?.[cell.x] !== 0 && calculation++;
               let right = grid[cell.y]?.[cell.x + 1] !== 0 && calculation++;
               let left = grid[cell.y]?.[cell.x - 1] !== 0 && calculation++;

               right && left && calculation++;
               down && right && left && calculation + 2;
          }
          return calculation;
     };

     threshold = calculateData(data);
     const collisionDetected = (data) => data.cells.some(cell => grid[cell.y]?.[cell.x] !== 0 || cell.y === End);

     for (let i = 0; i < 4; i++) {
          let rotationData = 0;
          let shadowCopy = structuredClone(data);

          for (let j = 0; j < i; j++) {
              rotate(shadowCopy);
              const shiftValue = tetromino.cells[2].x - shadowCopy.cells[2].x;
              shadowCopy.cells.forEach(cell => cell.x += shiftValue);
          }

          while (shadowCopy.cells.every(cell => cell.y + 1 <= End && grid[cell.y + 1]?.[cell.x] === 0)) {
               shadowCopy.cells.forEach(cell => cell.y += 1);
          }

          if (collisionDetected(shadowCopy)) continue;

          rotationData = calculateData(shadowCopy);
          if (rotationData <= threshold) continue;
          threshold = rotationData;
          overrideCells = shadowCopy.cells;
     }

     if (overrideCells) {
          data.cells = overrideCells;
     }

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
     if (tetromino.cells.some(cell => cell.y === End)) return;
     const originals = structuredClone(tetromino.cells);

     rotate(tetromino);
     let collisionDetected = tetromino.cells.some(cell => grid[cell.y]?.[cell.x] !== 0 || cell.y === End);
     let wallkickData = [] = tetromino.name === 'I' ? [-1, +1, -2, +2] : [-1, +1];

     for (let i = 0; i < 4; i++) {
          if (!collisionDetected) break;

          for (let kick of wallkickData) {
               tetromino.cells.forEach(cell => cell.x += kick);
               collisionDetected = tetromino.cells.some(cell => grid[cell.y]?.[cell.x] !== 0 || cell.y === End);

               if (!collisionDetected) break;
               tetromino.cells.forEach(cell => cell.x -= kick);
          }

          if (collisionDetected) rotate();
     }

     if (collisionDetected) tetromino.cells = originals;
}
