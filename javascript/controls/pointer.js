import { Dx, MOBILE_WIDTH_THRESHOLD } from "../config.js";
import { pause, tetromino, gameEngine, resetGameplayInterval, switchToKeyboard } from "../engine.js";

const pointerTarget = document.querySelector('#drop');
let moveDownInterval = null;
let previousCellMouseX = null;
let isOverCanvas = false;
let clickStartTime = 0;
let isMobile = false;

window.addEventListener('DOMContentLoaded', updateDeviceType);
window.addEventListener('resize', updateDeviceType);

function updateDeviceType() {
    isMobile = window.innerWidth <= MOBILE_WIDTH_THRESHOLD;
}

pointerTarget.addEventListener('mouseover', () => (isOverCanvas = true));
pointerTarget.addEventListener('mouseout', () => (isOverCanvas = false));
pointerTarget.addEventListener('contextmenu', (e) => e.preventDefault());

pointerTarget.addEventListener('mousemove', (e) => {
    if (pause || !isOverCanvas || isMobile) return;
    if (e) switchToKeyboard(false);

    const currentMouseX = e.offsetX;
    const cellMouseX = Math.floor(currentMouseX / Dx);
    let cellX = getTetrominoMiddleX(tetromino);
    
    if (previousCellMouseX === null || cellMouseX !== previousCellMouseX) {
        while (cellX !== cellMouseX) {
            const moved = cellX < cellMouseX
                ? tetromino.moveRight()
                : tetromino.moveLeft();

            if (!moved) break;

            cellX = getTetrominoMiddleX(tetromino);
        }
        gameEngine();
    }

    previousCellMouseX = cellMouseX;
});

pointerTarget.addEventListener('mousedown', (e) => {
    if (pause || !isOverCanvas || e.button !== 0 || isMobile) return;
    if (e) switchToKeyboard(false);

    clickStartTime = performance.now();

    moveDownInterval = setTimeout(() => {
        if (!pause && isOverCanvas) {
            moveDownInterval = setInterval(() => {
                if (!pause && isOverCanvas) {
                    tetromino.moveDown();
                    resetGameplayInterval();
                    gameEngine();
                }
            }, 25);
        }
    }, 200);
});

pointerTarget.addEventListener('mouseup', async (e) => {
    if (pause || !isOverCanvas || isMobile) return;

    const clickEndTime = performance.now();
    const clickDuration = clickEndTime - clickStartTime;

    if (moveDownInterval) {
        clearInterval(moveDownInterval);
        clearTimeout(moveDownInterval);
        moveDownInterval = null;
    }

    if (e.button === 0 && clickDuration <= 200) {
        await tetromino.shadowMove();
        gameEngine();
    }

    if (e.button === 2) {
        tetromino.calculateRotation();
        gameEngine();
    }
});

function getTetrominoMiddleX(data) {
    const xCoords = data.cells.map(cell => cell.x);
    const minX = Math.min(...xCoords);
    const maxX = Math.max(...xCoords);
    return Math.floor((minX + maxX) / 2);
}
