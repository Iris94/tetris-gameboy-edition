import { pause, tetromino, gameEngine, resetGameplayInterval } from "../engine.js";
import { rotation } from "../rotation.js";

const pointerTarget = document.querySelector('#drop');
let moveDownInterval = null;
let previousMouseX = 0;
let previousMouseY = 0;
let isOverCanvas = false;
let isMouseDown = false;

pointerTarget.addEventListener('mouseover', () => {
    isOverCanvas = true;
});

pointerTarget.addEventListener('mouseout', () => {
    isOverCanvas = false;
    if (isMouseDown) {
        isMouseDown = false;
        clearInterval(moveDownInterval);
    }
});

pointerTarget.addEventListener('mousemove', e => {
    if (pause || !isOverCanvas) return;

    const currentMouseX = e.offsetX;
    const deltaX = currentMouseX - previousMouseX;

    if (Math.abs(deltaX) > 20) {
        deltaX > 0 ? tetromino.moveRight() : tetromino.moveLeft();
        previousMouseX = currentMouseX;
        gameEngine();
    }
});

pointerTarget.addEventListener('mousedown', e => {
    if (pause || !isOverCanvas || e.button !== 0) return; 
    isMouseDown = true;

    moveDownInterval = setInterval(() => {
        if (!pause && isMouseDown && isOverCanvas) {
            tetromino.moveDown();
            resetGameplayInterval();
            gameEngine();
        }
    }, 25); 
});

pointerTarget.addEventListener('mouseup', e => {
    if (e.button !== 0) return; 
    isMouseDown = false;
    clearInterval(moveDownInterval);
});

pointerTarget.addEventListener('click', e => {
    e.preventDefault();
    console.log('test')
})


// window.addEventListener('mousedown', e => {
//     if (pause || e.button !== 0) return; // Left button only
//     isMouseDown = true;
//     moveDownInterval = setInterval(() => {
//         if (!pause && isMouseDown) {
//             tetromino.moveDown();
//             resetGameplayInterval();
//             gameEngine();
//         }
//     }, 100); // Match invasion.js animation speed
// });

// window.addEventListener('mouseup', e => {
//     if (e.button !== 0) return; // Left button only
//     isMouseDown = false;
//     clearInterval(moveDownInterval);
// });

// window.addEventListener('contextmenu', e => {
//     e.preventDefault();
//     if (pause) return;
//     rotation();
//     gameEngine();
// });
