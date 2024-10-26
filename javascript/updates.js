import { ctx, canvas, Rows, Cols, CellWidth, CellHeight, tetromino, boardMatrix} from "./board.js";
import { boardLoop, tetrominoLoop } from "./math.js";

export function clearCanvas() {
     ctx.clearRect(0, 0, canvas.width, canvas.height);
}

export function drawBoard() {
     ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
     ctx.lineWidth = 1

     for (let row = 0; row < Rows; row++) {
          for (let col = 0; col < Cols; col++) {
               const x = col * CellWidth;
               const y = row * CellHeight;

               ctx.strokeRect(x, y, CellWidth, CellHeight)
          }
     }
}

export function fillBoard() {
     boardLoop(cell => {
         if (cell !== null) {

             const [x, y, color] = cell;
 
             ctx.fillStyle = color;
             ctx.lineWidth = 1;
             ctx.strokeStyle = "#ffff";
             ctx.shadowColor = "#000";
             ctx.shadowOffsetX = 1;
             ctx.shadowOffsetY = 1;
             ctx.shadowBlur = 5;
 
             ctx.fillRect(x, y, CellWidth, CellHeight);
             ctx.strokeRect(x, y, CellWidth, CellHeight);
         }
     });
}

export function drawTetromino() {
     ctx.fillStyle = tetromino.color;
     ctx.lineWidth = 1;
     ctx.strokeStyle = "#ffff";
     ctx.shadowColor = "#000";
     ctx.shadowOffsetX = 1;
     ctx.shadowOffsetY = 1;
     ctx.shadowBlur = 5

     tetromino.cells.forEach((cell) => {
          ctx.fillRect(cell.x, cell.y, CellWidth, CellHeight);
          ctx.strokeRect(cell.x, cell.y, CellWidth, CellHeight)
     })
}

export function fillMatrix () {
     tetrominoLoop(cell => {
          boardMatrix[cell.yn][cell.xn] = [cell.x, cell.y, cell.color];
     })
}