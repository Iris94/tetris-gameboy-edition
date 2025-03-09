import { Cols, ctx, hctx, manaCanvas, mctx, Rows, sctx } from "./config.js";
import { redrawTetrominos } from "./draws.js";
import { grid, tetromino, tetrominoId, objectPoolArray, reuseObjectIdArray, activeTetrominos, emptyBoardData, collectDropCells, copiedActiveTetromino } from "./engine.js";

export const copyImageData = () => ctx.getImageData(0, 0, canvas.width, canvas.height);
export const pasteImageData = (data) => ctx.putImageData(data, 0, 0);
export const clearMainBoard = () => ctx.clearRect(0, 0, canvas.width, canvas.height);
export const clearHud = () => hctx.clearRect(0, 0, hudCanvas.width, hudCanvas.height);
export const clearSpecial = () => sctx.clearRect(0, 0, special.width, special.height);
export const clearMana = () => mctx.clearRect(0, 0, manaCanvas.width, manaCanvas.height);
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
export const deepCopy = (data) => JSON.parse(JSON.stringify(data));
export const gameoverCheck = () => grid[0].some(cell => cell !== 0);
export const clearSet = (data) => data.clear();

export function updateGrid() {
     tetromino.cells.forEach(cell => {
          grid[cell.y][cell.x] = tetrominoId;
     })
}

export function initiateTetrominoInfo() {
     Object.assign(activeTetrominos[tetrominoId - 1], {
          color: tetromino.color,
          id: tetrominoId,
          name: tetromino.name,
          cells: tetromino.cells.map(cell => ({
               y: cell.y,
               x: cell.x,
               id: tetrominoId
          }))
     });
}

export function updateTetrominoInfoByCol(data) {
     let active = activeTetrominos[data - 1];
     if (!active) return;

     active.cells.forEach(cell => {
          grid[cell.y][cell.x] = 0;
     });

     reuseObjectIdArray.push(active.id);

     for (let key in active) {
          delete active[key];
     }
}

export function deleteTetrominoId(data) {
     reuseObjectIdArray.push(data.id);

     for (let key in data.id) {
          delete data.id[key]
     }
}

export function filterRows() {
     let filter = [...new Set(
          tetromino.cells
               .filter(cell => grid[cell.y].every(col => col !== 0))
               .map(cell => cell.y)
               .sort((a, b) => b - a)
     )];

     return filter.length !== 0 ? filter : false;
}

export function clearFilteredRows(data) {
     data.forEach(row => {
          for (let x = 0; x < Cols; x++) {
               if (grid[row][x] === 0) continue

               let active = activeTetrominos[grid[row][x] - 1];
               let index = active.cells.findIndex(cell => cell.x === x && cell.y === row);
               active.cells.splice(index, 1);

               active.cells.length === 0
                    ? deleteTetrominoId(active)
                    : null
          }
          grid[row] = Array(Cols).fill(0);
     })
}

export function shiftFilteredRows(data) {
     let target = data[0];

     for (let y = target; y >= 0; y--) {
          if (grid[y].some(cell => cell !== 0)) {

               for (let x = 0; x < Cols; x++) {
                    if (grid[y][x] === 0) continue;

                    collectDropCells.add(grid[y][x])
                    let active = activeTetrominos[grid[y][x] - 1];
                    let index = active.cells.findIndex(cell => cell.x === x && cell.y === y);
                    active.cells[index].y = target;
               }

               grid[target] = [...grid[y]];
               grid[y] = new Array(Cols).fill(0);
               target--;
          }
     }
}

export function shiftFilteredCols() {
     let recursion = true;

     while (recursion) {
          recursion = false;

          collectDropCells.forEach(shape => {
               let active = activeTetrominos[shape - 1];

               if (active.cells.every(cell => cell.y + 1 < Rows &&
                    (grid[cell.y + 1][cell.x] === 0 || grid[cell.y + 1][cell.x] === active.id)
               )) {
                    active.cells.forEach(cell => {
                         grid[cell.y][cell.x] = 0;
                         cell.y += 1;
                         grid[cell.y][cell.x] = active.id;
                    });

                    recursion = true;
               }
          });
     }
}

export function checkForClears() {
     let targetRows = [];

     for (let y = Rows - 1; y > 0; y--) {
          if (grid[y].every(cell => cell === 0)) continue;
          if (grid[y].every(cell => cell !== 0)) {
               targetRows.push(y);
          }
     }

     return targetRows;
}

export function checkForRedraws(data, gridCopy) {
     clearMainBoard();
     pasteImageData(emptyBoardData);

     data !== Rows - 1 ? redrawTetrominos(data, gridCopy) : null;
}

export function prepareDropCells() {
     return [...collectDropCells].flatMap(shape => {
          let current = activeTetrominos[shape - 1];
          let past = copiedActiveTetromino[shape - 1];

          return current.cells.map((cell, index) => ({
               x: past.cells[index].x,
               oldY: past.cells[index].y,
               newY: cell.y,
               color: current.color
          }));
     });
}

export function initiateId() {
     let id = 0;
     reuseObjectIdArray.length !== 0 ? reuseId() : lendObject();

     function reuseId() {
          id = reuseObjectIdArray[0];
          reuseObjectIdArray.shift();
     }

     function lendObject() {
          const emptyObject = objectPoolArray.pop();
          id = activeTetrominos.length - objectPoolArray.length;
          activeTetrominos.splice((id - 1), 1, emptyObject)
     }

     return id
}
