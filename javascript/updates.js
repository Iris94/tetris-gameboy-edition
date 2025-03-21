import { Cols, ctx, End, hctx, manaCanvas, mctx, Rows, sctx, shadowCanvas, shctx, Start } from "./config.js";
import { grid, tetromino, tetrominoId, objectPoolArray, reuseObjectIdArray, tetrominoObjects } from "./engine.js";

export const copyImageData = () => ctx.getImageData(0, 0, canvas.width, canvas.height);
export const pasteImageData = (data) => ctx.putImageData(data, 0, 0);
export const clearMainBoard = () => ctx.clearRect(0, 0, canvas.width, canvas.height);
export const clearShadows = () => shctx.clearRect(0, 0, shadowCanvas.width, shadowCanvas.height);
export const clearHud = () => hctx.clearRect(0, 0, hudCanvas.width, hudCanvas.height);
export const clearSpecial = () => sctx.clearRect(0, 0, special.width, special.height);
export const clearMana = () => mctx.clearRect(0, 0, manaCanvas.width, manaCanvas.height);
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
export const gameoverCheck = () => grid[2].some(cell => cell !== 0);
export const unitType = (data) => data.forEach(shape => tetrominoObjects[shape - 1].unit = false);

export function updateGrid() {
     tetromino.cells.forEach(cell => {
          grid[cell.y][cell.x] = tetrominoId;
     })
}

export function initiateTetrominoInfo() {
     Object.assign(tetrominoObjects[tetrominoId - 1], {
          color: tetromino.color,
          id: tetrominoId,
          name: tetromino.name,
          unit: true,
          cells: tetromino.cells.map((cell, index) => ({
               y: cell.y,
               x: cell.x,
               id: index
          }))
     });
}

export function deleteTetrominoId(data) {
     reuseObjectIdArray.push(data.id);

     for (let key in data) {
          delete data[key];
     }
}

export function clearSingularCells(data) {
     data.forEach(shape => {
          let block = tetrominoObjects[shape - 1];
          block.cells.forEach(cell => grid[cell.y][cell.x] = 0)
          deleteTetrominoId(block)
          tetrominoObjects[shape - 1] = {};
     })
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

export function collectBlocks(data) {
     let collectables = new Set();

     for (let y = data; y > 0; y--) {
          for (let x = 0; x < Cols; x++) {
               grid[y][x] > 0 && collectables.add(grid[y][x])
          }
     }

     return collectables;
}

export function clearFilteredRows(data) {
     let singularCellsToClear = new Set();

     data.forEach(row => {
          grid[row].forEach((cell, x) => {
               if (cell === 0) return;

               let block = tetrominoObjects[cell - 1];
               let index = block.cells.findIndex(cell => cell.x === x && cell.y === row);
               block.cells.splice(index, 1);

               block.cells.length === 0
                    && singularCellsToClear.add(cell);

          });

          grid[row] = Array(Cols).fill(0);
     });


     singularCellsToClear.length !== 0
          && clearSingularCells(singularCellsToClear);
}

export function shiftFilteredRows(data) {
     let target = data;

     for (let y = target; y >= 0; y--) {
          if (grid[y].some(cell => cell > 0)) {

               for (let x = 0; x < Cols; x++) {
                    if (grid[y][x] === 0) continue;

                    let block = tetrominoObjects[grid[y][x] - 1];
                    let index = block.cells.findIndex(cell => cell.x === x && cell.y === y);
                    block.cells[index].y = target;
               }

               grid[target] = [...grid[y]];
               grid[y] = new Array(Cols).fill(0);
               target--;
          }
     }
}

export function shiftFilteredCols(data) {

     let recursion = true;

     while (recursion) {
          recursion = false;

          data.forEach(shape => {
               let block = tetrominoObjects[shape - 1];
               let sortedCells = block.cells.sort((a, b) => b.y - a.y);

               const moveBlockDown = (id, sortedCells) => {
                    sortedCells.forEach(cell => {
                         grid[cell.y][cell.x] = 0;
                         cell.y += 1;
                         grid[cell.y][cell.x] = id;
                    });
               }

               if (block.unit) {
                    let canMoveDown = sortedCells.every(cell => {
                         return (cell.y + 1 <= End &&
                              (grid[cell.y + 1][cell.x] === 0 || grid[cell.y + 1][cell.x] === block.id));
                    });

                    if (canMoveDown) {
                         moveBlockDown(block.id, sortedCells);
                         recursion = true;
                    }
               }
               else {
                    let movableCells = sortedCells.filter(cell =>
                         cell.y + 1 <= End && grid[cell.y + 1][cell.x] === 0
                    );

                    if (movableCells.length > 0) {
                         moveBlockDown(block.id, movableCells);
                         recursion = true;
                    }
               }
          });
     }
}

export function checkForClears() {
     let targetRows = [];

     for (let y = End; y > Start; y--) {
          if (grid[y].every(cell => cell === 0)) break;
          if (grid[y].every(cell => cell !== 0)) {
               targetRows.push(y);
          }
     }

     return targetRows;
}

export function reconstructGrid(dataGrid, dataCells) {
     clearMainBoard();
     if (dataCells.length === 0) return
     dataCells.forEach(cell => dataGrid[cell.newY][cell.x] = 0);
}

export function prepareDropCells(data, collectables) {
     return [...collectables].flatMap(shape => {
          let current = tetrominoObjects[shape - 1];
          let past = data[shape - 1];

          return current.cells.map(cell => {
               let previousLocation = past.cells.find(target => target.id === cell.id);

               return {
                    newY: cell.y,
                    oldY: previousLocation.y,
                    x: previousLocation.x,
                    color: current.color
               }
          });
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
          id = tetrominoObjects.length - objectPoolArray.length;
          tetrominoObjects.splice((id - 1), 1, emptyObject)
     }

     return id
}
