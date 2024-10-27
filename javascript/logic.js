import { ctx, canvas, tetromino, boardMatrix } from "./board.js";
import { boardLoop, tetrominoLoop } from "./math.js";
import { CellHeight, CellWidth } from "./config.js";

export function clearCanvas() {
     ctx.clearRect(0, 0, canvas.width, canvas.height);
}

export function drawBoard() {
     ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
     ctx.lineWidth = 1

     boardLoop((cell, row, col) => {
          const x = col * CellWidth;
          const y = row * CellHeight;

          ctx.strokeRect(x, y, CellWidth, CellHeight);

          if (cell) {
               fillBoard(cell);
          }
     })
}

function fillBoard(filledCell) {
     ctx.save();
     ctx.fillStyle = filledCell.color;
     ctx.lineWidth = 1;
     ctx.strokeStyle = "#ffff";
     ctx.shadowColor = "#000";
     ctx.shadowOffsetX = 1;
     ctx.shadowOffsetY = 1;
     ctx.shadowBlur = 5;

     ctx.fillRect(filledCell.pixelX, filledCell.pixelY, CellWidth, CellHeight);
     ctx.strokeRect(filledCell.pixelX, filledCell.pixelY, CellWidth, CellHeight);

     ctx.restore();

}

export function drawTetromino() {
     ctx.fillStyle = tetromino.color;
     ctx.lineWidth = 1;
     ctx.strokeStyle = "#ffff";
     ctx.shadowColor = "#000";
     ctx.shadowOffsetX = 1;
     ctx.shadowOffsetY = 1;
     ctx.shadowBlur = 5

     tetrominoLoop((pixelX, pixelY) => {

          ctx.fillRect(pixelX, pixelY, CellWidth, CellHeight);
          ctx.strokeRect(pixelX, pixelY, CellWidth, CellHeight);

     });

}

export function fillMatrix() {
     tetrominoLoop((pixelX, pixelY, gridX, gridY, color) => {
          boardMatrix[gridY][gridX] = { pixelX, pixelY, color };
     })
}