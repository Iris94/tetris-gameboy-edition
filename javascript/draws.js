import { Cols, Rows, ctx, hctx, mctx, Dx, Dy, Position, Invasion, Ninja, Artillery } from "./config.js";
import { tetromino, grid, nextTetromino, activeTetrominos } from "./engine.js";

export function drawMainBoard() {
     ctx.strokeStyle = 'rgba(220, 215, 186, 0.1)';
     ctx.lineWidth = 1

     for (let row = 0; row < Rows; row++) {
          for (let col = 0; col < Cols; col++) {

               const x = col * Dx;
               const y = row * Dy;

               ctx.strokeRect(x, y, Dx, Dy)
          }
     }
}

export function drawTetromino() {
     ctx.fillStyle = tetromino.color;
     ctx.lineWidth = 1;
     ctx.strokeStyle = "#DCD7BA";
     ctx.shadowColor = "#000";
     ctx.shadowOffsetX = 1;
     ctx.shadowOffsetY = 1;
     ctx.shadowBlur = 1

     tetromino.cells.forEach(cell => {

          ctx.fillRect(cell.x * Dx, cell.y * Dy, Dx, Dy);
          ctx.strokeRect(cell.x * Dx, cell.y * Dy, Dx, Dy);
     })
}

export function redrawTetrominos(target = 0) {
     ctx.lineWidth = 1;
     ctx.strokeStyle = "#DCD7BA";
     ctx.shadowColor = "#000";
     ctx.shadowOffsetX = 1;
     ctx.shadowOffsetY = 1;
     ctx.shadowBlur = 2

     for (let row = Rows - 1; row > target; row--) {
          for (let col = 0; col < Cols; col++) {

               if (grid[row][col] !== 0) {
                    let active = grid[row][col];
                    ctx.fillStyle = activeTetrominos[active - 1].color;
                    ctx.fillRect(col * Dx, row * Dy, Dx, Dy);
                    ctx.strokeRect(col * Dx, row * Dy, Dx, Dy);
               }
          }
     }
}

export function drawHud() {
     hctx.strokeStyle = 'rgba(220, 215, 186, 0.1)';
     hctx.lineWidth = 1

     for (let row = 0; row < 3; row++) {
          for (let col = 0; col < 4; col++) {

               const x = col * Dx;
               const y = row * Dy;

               hctx.strokeRect(x, y, Dx, Dy)
          }
     }
}

export function drawNextTetromino() {
     hctx.fillStyle = nextTetromino.color;
     hctx.lineWidth = 1;
     hctx.strokeStyle = "#DCD7BA";
     hctx.shadowColor = "#000";
     hctx.shadowOffsetX = 1;
     hctx.shadowOffsetY = 1;
     hctx.shadowBlur = 2

     nextTetromino.cells.forEach(cell => {
          let x = cell.x - Position

          hctx.fillRect(x * Dx, cell.y * Dy, Dx, Dy);
          hctx.strokeRect(x * Dx, cell.y * Dy, Dx, Dy);
     })
}

export function drawScore(score) {
     hctx.strokeStyle = 'rgba(220, 215, 186, 0.1)';
     hctx.lineWidth = 1;

     hctx.strokeRect(0, 75, hudCanvas.width, 75);
     hctx.font = "12px Gill Sans";
     hctx.fillStyle = 'rgba(220, 215, 186, 0.9)';

     hctx.fillText("score", 20, 110);
     hctx.fillText(`${score}`, 20, 130);
}

export function drawLevel(level) {
     hctx.strokeStyle = 'rgba(220, 215, 186, 0.1)';
     hctx.lineWidth = 1;

     hctx.strokeRect(0, 170, hudCanvas.width, 75);
     hctx.font = "12px Gill Sans";
     hctx.fillStyle = 'rgba(220, 215, 186, 0.9)';

     hctx.fillText("level", 20, 205);
     hctx.fillText(`${level}`, 20, 225);
}

export function drawMana(data) {
     mctx.clearRect(0, 0, manaCanvas.width, manaCanvas.height);

     const maxHeight = (manaCanvas.height / 5) * 3;
     const currentHeight = maxHeight * (data / 100);

     const manaFill = mctx.createLinearGradient(0, manaCanvas.height - maxHeight, 0, manaCanvas.height);
     manaFill.addColorStop(0, '#8bc276');
     manaFill.addColorStop(1, 'transparent');

     mctx.fillStyle = manaFill;
     mctx.fillRect(20, manaCanvas.height - currentHeight, 15, currentHeight);

     mctx.strokeStyle = 'rgba(220, 215, 186, 0.1)';
     mctx.lineWidth = 1;
     mctx.strokeRect(20, manaCanvas.height - maxHeight, 15, maxHeight);
}

export function drawSpecialNinja() {
     Ninja.onload = () => {
          mctx.drawImage(Ninja, 15, 120, 25, 25);
     }
}

export function drawSpecialArtillery() {
     Artillery.onload = () => {
          mctx.drawImage(Artillery, 15, 80, 25, 25);
     }
}

export function drawSpecialTetra() {
     Invasion.onload = () => {
          mctx.drawImage(Invasion, 15, 40, 25, 25);
     }
}