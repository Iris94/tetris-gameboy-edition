import { Cols, Rows, ctx, hctx, mctx, Dx, Dy, Position, Invasion, Ninja, Artillery } from "./config.js";
import { tetromino, grid, nextTetromino, activeTetrominos } from "./engine.js";

export function drawMainBoard() {
     ctx.strokeStyle = 'rgba(185, 184, 176, 0.05)';
     ctx.lineWidth = 1

     for (let row = 0; row < Rows; row++) {
          for (let col = 0; col < Cols; col++) {

               const x = col * Dx;
               const y = row * Dy;

               ctx.strokeRect(x + 0.5, y + 0.5, Dx - 1, Dy - 1)
          }
     }
}

export function drawTetromino() {
     const shadowOffset = -0.75;
     const padding = 1;

     ctx.lineWidth = 1;
     ctx.shadowColor = "#000";
     ctx.shadowOffsetX = shadowOffset;
     ctx.shadowOffsetY = shadowOffset;
     ctx.shadowBlur = 0;

     tetromino.cells.forEach(cell => {
          const x = cell.x * Dx;
          const y = cell.y * Dy;

          ctx.fillStyle = tetromino.color;
          ctx.fillRect(x + padding, y + padding, Dx - padding * 2, Dy - padding * 2);

          ctx.strokeStyle = "#DCD7BA";
          ctx.strokeRect(x + 0.5 + padding, y + 0.5 + padding, Dx - 1 - padding * 2, Dy - 1 - padding * 2);
     });

     ctx.shadowColor = "transparent";
     ctx.shadowOffsetX = 0;
     ctx.shadowOffsetY = 0;
     ctx.shadowBlur = 0;
}

export function redrawTetrominos(target = 0) {
     const shadowOffset = -0.75;
     const padding = 1;

     ctx.shadowColor = "#000";
     ctx.shadowOffsetX = shadowOffset;
     ctx.shadowOffsetY = shadowOffset;
     ctx.shadowBlur = 0;

     ctx.lineWidth = 1;

     for (let row = Rows - 1; row > target; row--) {
          for (let col = 0; col < Cols; col++) {
               if (grid[row][col] !== 0) {
                    let active = grid[row][col];
                    const tetromino = activeTetrominos[active - 1];
                    const x = col * Dx;
                    const y = row * Dy;

                    ctx.fillStyle = tetromino.color;
                    ctx.fillRect(x + padding, y + padding, Dx - padding * 2, Dy - padding * 2);

                    ctx.strokeStyle = "#DCD7BA";
                    ctx.strokeRect(x + 0.5 + padding, y + 0.5 + padding, Dx - 1 - padding * 2, Dy - 1 - padding * 2);
               }
          }
     }

     ctx.shadowColor = "transparent";
     ctx.shadowOffsetX = 0;
     ctx.shadowOffsetY = 0;
     ctx.shadowBlur = 0;
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
     const shadowOffset = -0.75;
     const padding = 1;

     hctx.lineWidth = 1;
     hctx.shadowColor = "#000";
     hctx.shadowOffsetX = shadowOffset;
     hctx.shadowOffsetY = shadowOffset;
     hctx.shadowBlur = 0;

     nextTetromino.cells.forEach(cell => {
          let x = cell.x - Position;

          hctx.fillStyle = nextTetromino.color;
          hctx.fillRect(x * Dx + padding, cell.y * Dy + padding, Dx - padding * 2, Dy - padding * 2);

          hctx.strokeStyle = "#DCD7BA";
          hctx.strokeRect(x * Dx + 0.5 + padding, cell.y * Dy + 0.5 + padding, Dx - 1 - padding * 2, Dy - 1 - padding * 2);
     });

     hctx.shadowColor = "transparent";
     hctx.shadowOffsetX = 0;
     hctx.shadowOffsetY = 0;
     hctx.shadowBlur = 0;
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
     const maxHeight = (manaCanvas.height / 5) * 3;
     const currentHeight = maxHeight * (data / 100);
     mctx.clearRect(20, manaCanvas.height - maxHeight, 15, maxHeight + 5);

     const manaFill = mctx.createLinearGradient(0, manaCanvas.height - maxHeight, 0, manaCanvas.height);
     manaFill.addColorStop(1, 'transparent');  
     manaFill.addColorStop(0.75, '#064f1f');         
     manaFill.addColorStop(0, '#8bc276');

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