import { Dy, Dx, dctx, drop } from "../config.js";
import { redrawTetrominos } from "../draws.js";
import { clearMainBoard } from "../updates.js";

export async function drops(data) {
    return new Promise(resolve => {

        const startTime = performance.now();
        const shadowOffset = -0.75;

        dctx.shadowColor = "#000";
        dctx.shadowOffsetX = shadowOffset;
        dctx.shadowOffsetY = shadowOffset;
        dctx.shadowBlur = 0;
        dctx.strokeStyle = "#DCD7BA";
        dctx.lineWidth = 1;

        const animation = (currentTime) => {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / 100, 1);

            dctx.clearRect(0, 0, drop.width, drop.height);

            data.forEach(cell => {
                const path = (cell.oldY * Dy) + progress * ((cell.newY * Dy) - (cell.oldY * Dy));
                dctx.fillStyle = cell.color;
                dctx.fillRect(cell.x * Dx, path, Dx, Dy);
                dctx.strokeRect(cell.x * Dx, path, Dx, Dy);
            });

            if (progress < 1) {
                requestAnimationFrame(animation)
            }
            else {
                clearMainBoard();
                redrawTetrominos();
                dctx.clearRect(0, 0, drop.width, drop.height);
                resolve();
            }
        };

        requestAnimationFrame(animation);
    })
}
