import { CTX, DX, DY } from "./config.js";
import { grid, tetromino } from "./engine.js";

export const getGridData = () => CTX.getImageData(0, 0, canvas.width, canvas.height);

export const putGridData = (data) => CTX.putImageData(data, 0, 0);

export const clearGridData = () => CTX.clearRect(0, 0, canvas.width, canvas.height);

export const randomize = (data) => data[Math.floor(Math.random() * data.length)];


export function drawTetromino() {
     CTX.fillStyle = tetromino.color;
     CTX.lineWidth = 1;
     CTX.strokeStyle = "#ffff";
     CTX.shadowColor = "#000";
     CTX.shadowOffsetX = 1;
     CTX.shadowOffsetY = 1;
     CTX.shadowBlur = 5

     tetromino.cells.forEach(cell => {
          
          CTX.fillRect(
               cell.x * DX, 
               cell.y * DY, 
               DX, 
               DY
          );
          
          CTX.strokeRect(
               cell.x * DX, 
               cell.y * DY, 
               DX, 
               DY
          );
     })
}

export function updateGrid () {
     tetromino.cells.forEach(cell => {
          grid[cell.y][cell.x] = 1;
     })
}