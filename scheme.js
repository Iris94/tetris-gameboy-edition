import { Dx, Dy, sctx, special } from "../config.js";
import { tetromino } from "../engine.js"
import { clearMainBoard } from "../updates.js";

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
        const offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = special.width;
        offscreenCanvas.height = special.height;
        const offctx = offscreenCanvas.getContext('2d');

        const startTime = performance.now();

        const animation = (currentTime) => {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / 250, 1);

            offctx.clearRect(0, 0, special.width, special.height);

            shadowData.forEach(cell => {
                const currentX = cell.preX * Dx + progress * (cell.subX - cell.preX) * Dx;
                const currentY = cell.preY * Dy + progress * (cell.subY - cell.preY) * Dy;

                offctx.beginPath();
                offctx.arc(currentX + Dx / 2, currentY + Dy / 2, Dx / 2, 0, 2 * Math.PI);
                offctx.fillStyle = color;
                offctx.shadowColor = 'rgba(255, 255, 255, 1)';
                offctx.shadowOffsetY = -50
                offctx.shadowBlur = 20;
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
            const progress = Math.min(elapsedTime / 100, 1);

            sctx.fillStyle = `rgba(21, 21, 21, ${progress})`;
            shadowData.forEach(cell => {
                sctx.fillRect(cell.preX * Dx, cell.preY * Dy, Dx, Dy)
            })

            sctx.globalCompositeOperation = "multiply";
            sctx.globalAlpha = progress
            sctx.fillStyle = color;
            shadowData.forEach(cell => {
                sctx.fillRect(cell.subX * Dx, cell.subY * Dy, Dx, Dy)
            })

            sctx.globalCompositeOperation = "source-over";
            sctx.globalAlpha = 1;

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