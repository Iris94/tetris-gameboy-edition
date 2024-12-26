import { Cols, ctx, hctx, Rows, sctx } from "./config.js";
import { grid, tetromino, filterRowsData, tetrominoId, objectPoolArray, reuseObjectIdArray, activeTetrominos } from "./engine.js";

export const copyImageData = () => ctx.getImageData(0, 0, canvas.width, canvas.height);
export const pasteImageData = (data) => ctx.putImageData(data, 0, 0);
export const clearMainBoard = () => ctx.clearRect(0, 0, canvas.width, canvas.height);
export const clearHud = () => hctx.clearRect(0, 0, hudCanvas.width, hudCanvas.height);
export const clearSpecial = () => sctx.clearRect(0, 0, special.width, special.height);
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
export const deepCopy = (data) => JSON.parse(JSON.stringify(data));
export const clearFilteredRows = (data) => data.forEach(row => grid[row] = Array(Cols).fill(0));
export const gameoverCheck = () => grid[0].some(cell => cell !== 0);

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

export function updateTetrominoInfoByRow(data) {
     const idColorData = new Map();

     for (let y of data) {
          for (let x = 0; x < Cols; x++) {

               if (grid[y][x] === 0) continue;

               let cellId = grid[y][x];
               let active = activeTetrominos[cellId - 1];

               idColorData.set(active.id, active.name)

               let locateCell = active.cells.findIndex(cell => cell.x === x && cell.y === y);
               active.cells.splice(locateCell, 1);
               active.singleUnit = false;

               if (active.cells.length === 0) {
                    reuseObjectIdArray.push(active.id);

                    for (let key in active) {
                         delete active[key]
                    }
               }
          }
     }

     return idColorData;
}

export function filterRows() {
     let filter = [...new Set(
          tetromino.cells
               .filter(cell => grid[cell.y].every(col => col !== 0))
               .map(cell => cell.y)
               .sort((a, b) => a - b)
     )];

     return filter.length !== 0 ? filter : false;
}

export function shiftFilteredRows(data) {
     let movedId = new Set();

     for (let row of data) {
          for (let y = row - 1; y > 0; y--) {

               if (grid[y + 1].some(cell => cell !== 0)) break;

               grid[y + 1] = [...grid[y]];
               grid[y] = new Array(Cols).fill(0);

               grid[y + 1].forEach(cell => cell !== 0 ? movedId.add(cell) : null)
          }
     }

     movedId.forEach(id => activeTetrominos[id - 1].cells.forEach(cell => cell.y += data.length))
}

export function updateGridWithFilteredRows() {
     while (true) {
          let recursion = false;

          for (let y = Rows - 2; y > 0; y--) {
               for (let x = 0; x < Cols; x++) {

                    if (grid[y][x] === 0) continue;
                    if (grid[y + 1][x] !== 0) continue;

                    let active = activeTetrominos[grid[y][x] - 1];
                    active.cells.sort((a, b) => b.y - a.y);

                    while (true) {
                         if (active.cells.some(cell => cell.y === Rows - 1)) break;
                         if (active.cells.some(cell =>
                              grid[cell.y + 1][cell.x] !== 0 && grid[cell.y + 1][cell.x] !== cell.id)) break;

                         active.cells.forEach(cell => {
                              grid[cell.y][cell.x] = 0;
                              cell.y += 1;
                              grid[cell.y][cell.x] = cell.id;
                         })

                         recursion = true;
                    }
               }
          }
          if (!recursion) break;
     }
}

export function recheckRowState() {
     let targetRows = [];
     for (let y = Rows - 1; y > 0; y--) {
          if (grid[y].every(cell => cell === 0)) break;
          if (grid[y].every(cell => cell !== 0)) {
               targetRows.push(y);
          }
     }

     return targetRows;
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
