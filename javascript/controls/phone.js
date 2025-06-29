import { Dx, MOBILE_WIDTH_THRESHOLD } from "../config.js";
import { pause, tetromino, gameEngine } from "../engine.js";

const pointerTarget = document.querySelector('#drop');
let previousCellTouchX = null;
let isOverCanvas = false;
let isMobile = true;
let hasMoved = false;
let tapCount = 0;
let tapTimeout = null;

window.addEventListener('DOMContentLoaded', updateDeviceType);
window.addEventListener('resize', updateDeviceType);

function updateDeviceType() {
    isMobile = window.innerWidth <= MOBILE_WIDTH_THRESHOLD;
}

pointerTarget.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (pause || !isMobile) return;

    const rect = pointerTarget.getBoundingClientRect();
    const touchX = e.touches[0] ? e.touches[0].clientX - rect.left : null;
    isOverCanvas = touchX !== null && touchX >= 0 && touchX <= rect.width;
    
    if (!isOverCanvas) return;
    
    tapCount += 1;
    hasMoved = false;
});

pointerTarget.addEventListener('touchend', (e) => {
    e.preventDefault();
    if (pause || !isOverCanvas || !isMobile) return;

    if (tapTimeout) {
        clearTimeout(tapTimeout);
    }

    tapTimeout = setTimeout(() => {
        if (tapCount > 1) {
            hasMoved = true;
            tetromino.calculateRotation();
            gameEngine();
        } else if (!hasMoved) {
            tetromino.shadowMove().then(() => {
                gameEngine();
            });
        }
        tapCount = 0;
        tapTimeout = null;
    }, 75);

    isOverCanvas = false;
    previousCellTouchX = null;
});

pointerTarget.addEventListener('touchmove', e => {
    if (!isMobile) return;

    e.preventDefault();
    const rect = pointerTarget.getBoundingClientRect();
    const currentTouchX = e.touches[0] ? e.touches[0].clientX - rect.left : null;
    isOverCanvas = true;
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
    hasMoved = true;
    previousCellTouchX = cellTouchX;
})

function getTetrominoMiddleX(data) {
    const xCoords = data.cells.map(cell => cell.x);
    const minX = Math.min(...xCoords);
    const maxX = Math.max(...xCoords);
    return Math.floor((minX + maxX) / 2);
}
