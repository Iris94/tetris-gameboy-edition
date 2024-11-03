import { COLS, CTX, DX, DY, ROWS, STRING_EMPTY } from "./config.js";
import { grid, tetromino } from "./engine.js";

export const getGridData = () => CTX.getImageData(0, 0, canvas.width, canvas.height);
export const putGridData = (data) => CTX.putImageData(data, 0, 0);

export const clearGridData = () => CTX.clearRect(0, 0, canvas.width, canvas.height);
export const randomize = (data) => data[Math.floor(Math.random() * data.length)];

export function updateGrid() {
     tetromino.cells.forEach(cell => {
          grid[cell.y][cell.x] = tetromino.color;
     })
}

export function clearRow() {
     let rows = [...new Set(
          tetromino.cells
               .filter(cell => grid[cell.y].every(col => col !== STRING_EMPTY))
               .map(cell => cell.y)
               .sort((a, b) => b - a)
     )];

     if (rows.length === 0) return false;

     for (let row of rows) {
          grid[row] = Array(COLS).fill(STRING_EMPTY);

          for (let y = row; y >= 0; y--) {
               grid[y] = grid[y - 1];
          }

          grid[0] = Array(COLS).fill(STRING_EMPTY);
     }

     return true;
}
