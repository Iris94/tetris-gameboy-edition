import { activeTetrominos, emptyBoardData, grid } from "../engine.js";
import { Cols, Rows, Dy, Dx, dctx } from "../config.js";
import { clearMainBoard, pasteImageData } from "../updates.js";
import { redrawTetrominos } from "../draws.js";

export async function drops(target, originalActiveTetromino) {
    const duration = 50;
    const promises = [];
    let shapes = new Set();

    clearMainBoard();
    pasteImageData(emptyBoardData);

    target < Rows - 1 ? redrawTetrominos(target) : null;

    const cellsToAnimate = [];

    for (let y = target; y >= 0; y--) {
        for (let x = 0; x < Cols; x++) {
            if (grid[y][x] === 0) continue;

            shapes.add(grid[y][x]);
            if (originalActiveTetromino[grid[y][x] - 1]) {
                cellsToAnimate.push({ x, y, id: grid[y][x] });
            }
        }
    }

    for (let cell of cellsToAnimate) {
        promises.push(new Promise(resolve => {
            dropAnimation(cell.id, duration, originalActiveTetromino, resolve);
        }));
    }

    await Promise.all(promises);
}

function dropAnimation(id, duration, originalActiveTetromino, resolve) {
    const shape = originalActiveTetromino[id - 1];
    const startPositions = shape.cells.map(cell => cell.y * Dy);
    const endPositions = activeTetrominos[id - 1].cells.map(cell => cell.y * Dy);
    const startTime = performance.now();

    const shadowOffset = -0.75;
    const padding = 1;

    const animation = (currentTime) => {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);

        dctx.beginPath();
        dctx.clearRect(0, 0, dctx.canvas.width, dctx.canvas.height);

        dctx.shadowColor = "#000";
        dctx.shadowOffsetX = shadowOffset;
        dctx.shadowOffsetY = shadowOffset;
        dctx.shadowBlur = 0;

        for (let index = 0; index < shape.cells.length; index++) {
            const cell = shape.cells[index];
            const startY = startPositions[index];
            const endY = endPositions[index];
            const path = startY + progress * (endY - startY);

            dctx.fillStyle = shape.color;
            dctx.fillRect(cell.x * Dx + padding, path + padding, Dx - padding * 2, Dy - padding * 2);

            dctx.strokeStyle = "#DCD7BA";
            dctx.lineWidth = 1;
            dctx.strokeRect(cell.x * Dx + 0.5 + padding, path + 0.5 + padding, Dx - 1 - padding * 2, Dy - 1 - padding * 2);
        }

        dctx.restore(); 

        progress < 1
            ? requestAnimationFrame(animation)
            : (dctx.clearRect(0, 0, dctx.canvas.width, dctx.canvas.height), resolve())
    };

    requestAnimationFrame(animation);
}
