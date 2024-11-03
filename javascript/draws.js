import { COLS, ROWS, CTX, HUD_CTX, DX, DY, STRING_EMPTY, POSITION } from "./config.js";
import { tetromino, grid, nextTetromino } from "./engine.js";

export function drawGrid () {
     CTX.strokeStyle = 'rgba(255, 255, 255, 0.1)';
     CTX.lineWidth = 1

     for (let row = 0; row < ROWS; row++) {
          for (let col = 0; col < COLS; col++) {

               const x = col * DX;
               const y = row * DY;

               CTX.strokeRect(x, y, DX, DY)
          }
     }
}

export function drawTetromino () {
     CTX.fillStyle = tetromino.color;
     CTX.lineWidth = 1;
     CTX.strokeStyle = "#ffff";
     CTX.shadowColor = "#000";
     CTX.shadowOffsetX = 1;
     CTX.shadowOffsetY = 1;
     CTX.shadowBlur = 2

     tetromino.cells.forEach(cell => {

          CTX.fillRect(cell.x * DX, cell.y * DY, DX, DY);
          CTX.strokeRect(cell.x * DX, cell.y * DY, DX, DY);
     })
}

export function redrawTetrominos () {
     CTX.lineWidth = 1;
     CTX.strokeStyle = "#ffff";
     CTX.shadowColor = "#000";
     CTX.shadowOffsetX = 1;
     CTX.shadowOffsetY = 1;
     CTX.shadowBlur = 2

     for (let row = 0; row < ROWS; row++) {
          for (let col = 0; col < COLS; col++) {

               if (grid[row][col] !== STRING_EMPTY) {

                    CTX.fillStyle = grid[row][col];
                    CTX.fillRect(col * DX, row * DY, DX, DY);
                    CTX.strokeRect(col * DX, row * DY, DX, DY);
               }
          }
     }
}

export function drawNextTetromino () {
     HUD_CTX.fillStyle = nextTetromino.color;
     HUD_CTX.lineWidth = 1;
     HUD_CTX.strokeStyle = "#ffff";
     HUD_CTX.shadowColor = "#000";
     HUD_CTX.shadowOffsetX = 1;
     HUD_CTX.shadowOffsetY = 1;
     HUD_CTX.shadowBlur = 2

     nextTetromino.cells.forEach(cell => {
          let x = cell.x - POSITION

          HUD_CTX.fillRect(x * DX, cell.y * DY, DX, DY);
          HUD_CTX.strokeRect(x * DX, cell.y * DY, DX, DY);
     })
}

export function drawNextGrid () {
     HUD_CTX.strokeStyle = 'rgba(255, 255, 255, 0.1)';
     HUD_CTX.lineWidth = 1

     for (let row = 0; row < 3; row++) {
          for (let col = 0; col < 4; col++) {

               const x = col * DX;
               const y = row * DY;

               HUD_CTX.strokeRect(x, y, DX, DY)
          }
     }
}