import { Dx, MOBILE_WIDTH_THRESHOLD } from "../config.js";
import { pause, tetromino, gameEngine, resetGameplayInterval } from "../engine.js";

const pointerTarget = document.querySelector('#drop');
let previousCellTouchX = null;
let isOverCanvas = false;
let isMobile = true;

window.addEventListener('DOMContentLoaded', updateDeviceType);
window.addEventListener('resize', updateDeviceType);

function updateDeviceType() {
    isMobile = window.innerWidth <= MOBILE_WIDTH_THRESHOLD;
}

pointerTarget.addEventListener('touchstart', e => {
    e.preventDefault();
})

pointerTarget.addEventListener('touchmove', e => {
    if (!isMobile) return;

    e.preventDefault();
    const rect = pointerTarget.getBoundingClientRect();
    const currentTouchX = e.touches[0] ? e.touches[0].clientX - rect.left : null;

    if (pause || !isOverCanvas || !currentTouchX) return;

    const cellTouchX = Math.floor(currentTouchX / Dx);
    let cellX = getTetrominoMiddleX(tetromino);

    if (previousCellTouchX === null || cellTouchX !== previousCellTouchX) {
        while (cellX !== cellTouchX) {
            const moved = cellX < cellTouchX
                ? tetromino.moveRight()
                : tetromino.moveLeft();
            if (!moved) break;
            cellX = getTetrominoMiddleX(tetromino);
        }
        gameEngine();
    }

    previousCellTouchX = cellTouchX;
})

function getTetrominoMiddleX(data) {
    const xCoords = data.cells.map(cell => cell.x);
    const minX = Math.min(...xCoords);
    const maxX = Math.max(...xCoords);
    return Math.floor((minX + maxX) / 2);
}