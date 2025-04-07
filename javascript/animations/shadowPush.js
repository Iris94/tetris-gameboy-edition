import { Dx, Dy, sctx, special } from "../config.js";
import { tetromino } from "../engine.js"
import { clearMainBoard } from "../updates.js";

const offscreenCanvas = document.createElement('canvas');
offscreenCanvas.width = special.width;
offscreenCanvas.height = special.height;
const offctx = offscreenCanvas.getContext('2d');

function getShadowPushData() {
    return [...tetromino.cells.map((cell, index) => {
        const shadow = tetromino.shadow.cells[index];
        return { preY: cell.y, subY: shadow.y, preX: cell.x, subX: shadow.x }
    })]
}

export async function shadowPush() {
    const shadowData = getShadowPushData();
    const color = tetromino.ghostColor;

    animateShadowTravel(shadowData, color);
    await animateShadowFade(shadowData, color);

    tetromino.cells = tetromino.shadow.cells;
    clearMainBoard();
    return true;
}

function animateShadowTravel(shadowData, color) {
    return new Promise(resolve => {
        const startTime = performance.now();

        const animation = (currentTime) => {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / 150, 1);

            offctx.clearRect(0, 0, special.width, special.height);

            shadowData.forEach(cell => {
                const currentX = cell.preX * Dx + progress * (cell.subX - cell.preX) * Dx;
                const currentY = cell.preY * Dy + progress * (cell.subY - cell.preY) * Dy;

                offctx.lineWidth = 2;
                offctx.globalAlpha = 1 - progress;
                offctx.strokeStyle = color;
                offctx.beginPath();
                offctx.moveTo(cell.preX * Dx, cell.preY * Dy);
                offctx.lineTo(currentX, currentY);
                offctx.stroke();

                offctx.globalAlpha = 1;
                offctx.beginPath();
                offctx.arc(currentX + Dx / 2, currentY + Dy / 2, 5, 0, 2 * Math.PI);
                offctx.fillStyle = color;
                offctx.shadowColor = '#fff';
                offctx.shadowBlur = 2;
                offctx.fill();
            });

            sctx.clearRect(0, 0, special.width, special.height);
            sctx.drawImage(offscreenCanvas, 0, 0);

            if (progress < 1) {
                requestAnimationFrame(animation);
            } else {
                offctx.clearRect(0, 0, special.width, special.height);
                sctx.clearRect(0, 0, special.width, special.height);
                resolve();
            }
        };

        requestAnimationFrame(animation);
    });
}

async function animateShadowFade(shadowData, color) {
    return new Promise(resolve => {
        const startTime = performance.now();

        const animation = (currentTime) => {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / 200, 1);

            sctx.fillStyle = `rgba(21, 21, 21, ${progress})`;
            shadowData.forEach(cell => {
                sctx.fillRect(cell.preX * Dx, cell.preY * Dy, Dx, Dy)
            })

            if (progress >= 0.75) {
                const fadeProgress = Math.min((elapsedTime - 150) / 200, 1);
                sctx.globalCompositeOperation = "multiply";
                sctx.globalAlpha = fadeProgress;
                sctx.fillStyle = color;
                shadowData.forEach(cell => {
                    sctx.fillRect(cell.subX * Dx, cell.subY * Dy, Dx, Dy)
                })

                sctx.globalCompositeOperation = "source-over";
                sctx.globalAlpha = 1;
            }

            if (progress < 1) {
                requestAnimationFrame(animation);
            }
            else {
                resolve();
                sctx.clearRect(0, 0, special.width, special.height);
            }
        }
        requestAnimationFrame(animation)
    });
}