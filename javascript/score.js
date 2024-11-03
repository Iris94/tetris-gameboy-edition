import { SCORE_CTX, DX, DY } from "./config.js";
import { randomize } from "./logic.js";
import { tetrominosArray, tetromino } from "./engine.js";

export const pickNextTetromino = (data) => data[Math.floor(Math.random() * data.length)];

export function drawNextTetromino () {


     SCORE_CTX.fillStyle = tetromino.color;
     SCORE_CTX.lineWidth = 1;
     SCORE_CTX.strokeStyle = "#ffff";
     SCORE_CTX.shadowColor = "#000";
     SCORE_CTX.shadowOffsetX = 1;
     SCORE_CTX.shadowOffsetY = 1;
     SCORE_CTX.shadowBlur = 5

     tetromino.cells.forEach(cell => {

          SCORE_CTX.fillRect(0, 0, DX, DY);
          SCORE_CTX.strokeRect(0, 0, DX, DY);
     })
}

export function drawScore () {

     SCORE_CTX.strokeStyle = 'rgba(255, 255, 255, 0.1)';
     SCORE_CTX.lineWidth = 1

     for (let row = 0; row < 3; row++) {
          for (let col = 0; col < 3; col++) {

               const x = col * DX;
               const y = row * DY;

               SCORE_CTX.strokeRect(x, y, DX, DY)
          }
     }
}