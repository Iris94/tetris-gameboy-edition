import { activeTetrominos, copiedActiveTetromino, emptyBoardData, filterRowsData, grid } from "../engine.js";
import { Cols, Rows, sctx, ctx, Dy, Dx, dctx } from "../config.js";
import { clearMainBoard, clearSpecial, pasteImageData } from "../updates.js";
import { drawMainBoard, redrawTetrominos } from "../draws.js";

export async function drops(target) {
     const duration = 200;
     const promises = [];
     let shapes = new Set();

     clearMainBoard();
     pasteImageData(emptyBoardData);
     
     target < Rows - 1 ? redrawTetrominos(target) : null;

     for (let y = target; y >= 0; y--) {
          for (let x = 0; x < Cols; x++) {

               if (grid[y][x] === 0) continue;

               shapes.add(grid[y][x]);
               promises.push(new Promise(resolve => dropAnimation(grid[y][x], x, y, duration, resolve)))
          }
     }

     await Promise.all(promises)
}

function dropAnimation(id, x, y, duration, resolve) {
     const shape = copiedActiveTetromino[id - 1];
     const startPositions = shape.cells.map(cell => cell.y * Dy);
     const endPositions = activeTetrominos[id - 1].cells.map(cell => cell.y * Dy);
     const startTime = performance.now();

     const animation = (currentTime) => {
          const elapsedTime = currentTime - startTime;
          const progress = Math.min(elapsedTime / duration, 1);

          shape.cells.forEach((cell, index) => {

               const path = startPositions[index] + progress * (endPositions[index] - startPositions[index]);

               dctx.clearRect(cell.x * Dx - 1, path - Dy - 1, Dx + 5, Dy + 5)

               dctx.fillStyle = '#292929'; 
               dctx.fillRect(cell.x * Dx, path, Dx, Dy);

               dctx.fillStyle = shape.color;
               dctx.lineWidth = 1;
               dctx.strokeStyle = "#DCD7BA";
               dctx.shadowColor = "#000";
               dctx.shadowOffsetX = 1;
               dctx.shadowOffsetY = 1;
               dctx.shadowBlur = 1
               dctx.fillRect(cell.x * Dx, path, Dx, Dy);
               dctx.strokeRect(cell.x * Dx, path, Dx, Dy);
          });

          if (progress < 1) {
               requestAnimationFrame(animation);
          } else {
               dctx.clearRect(0, 0, clear.width, clear.height)
               resolve();
          }
     };

     requestAnimationFrame(animation);
}

