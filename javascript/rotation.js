import { Cols, End } from "./config.js";
import { grid, tetromino } from "./engine.js";

export function shadowRotation(data) {
    while (data.cells.every(cell => cell.y + 1 <= End && grid[cell.y + 1]?.[cell.x] === 0)) {
        data.cells.forEach(cell => cell.y += 1);
    }

    if (data.name === 'O' || !tetromino.shadowSwitch) return;

    let shadowCells = null;
    let isEdge = false;
    let maxDrop = -1;
    let edgeShifts = [0];

    tetromino.cells.forEach(cell => {
        if (cell.x <= 0) edgeShifts = [-2, -1, 0];
        if (cell.x >= Cols - 1) edgeShifts = [2, 1, 0];
        if (edgeShifts.length > 1) isEdge = true
    })

    for (let i = 0; i < 4; i++) {
        let shadowCopy = structuredClone(data);

        for (let j = 0; j < i; j++) {
            rotate(shadowCopy);
        }

        let shifts = isEdge ? edgeShifts : [0]; 

        for (let shift of shifts) {
            let shiftedCopy = structuredClone(shadowCopy);
            shiftedCopy.cells.forEach(cell => cell.x += shift);

            if (shiftedCopy.cells.some(cell => cell.x < 0 || cell.x >= Cols)) continue;

            let dropCount = 0;
            while (shiftedCopy.cells.every(cell => cell.y + 1 <= End && grid[cell.y + 1]?.[cell.x] === 0)) {
                shiftedCopy.cells.forEach(cell => cell.y += 1);
                dropCount++;
            }

            if (!collisionDetected(shiftedCopy) && dropCount > maxDrop) {
                maxDrop = dropCount;
                shadowCells = structuredClone(shiftedCopy.cells);
            }
        }
    }

    if (!shadowCells) return;
    data.cells = shadowCells;

    let tempTetromino = structuredClone(tetromino);
    for (let i = 0; i < 4; i++) {
        rotate(tempTetromino);
        if (tempTetromino.cells.every((cell, idx) =>
            cell.x === shadowCells[idx].x && cell.y === shadowCells[idx].y)) {
            tetromino.cells = structuredClone(tempTetromino.cells);
            break;
        }
    }
}

function collisionDetected(data) {
    return data.cells.some(cell => grid[cell.y]?.[cell.x] !== 0);
}

function rotate(data) {
    if (data.cells.some(cell => grid[cell.y + 1][cell.x] !== 0))
        data.cells.forEach(cell => cell.y -= 1);

    data.cells.forEach(cell => {
        let dx = cell.x - data.cells[2].x;
        let dy = cell.y - data.cells[2].y;
        cell.x = data.cells[2].x - dy;
        cell.y = data.cells[2].y + dx;
    });

    if (!collisionDetected(data)) return;

    const minX = Math.min(...data.cells.map(cell => cell.x));
    const maxX = Math.max(...data.cells.map(cell => cell.x));

    const collisionByX = new Set(
        data.cells
            .filter(cell => grid[cell.y]?.[cell.x] !== 0)
            .map(cell => cell.x)
    );

    collisionByX.forEach(value => {
        value > minX
            ? data.cells.forEach(cell => cell.x -= 1)
            : value < maxX
                ? data.cells.forEach(cell => cell.x += 1)
                : null;
    });
}

export function rotation() {
    if (tetromino.name === 'O') return;
    if (tetromino.cells.some(cell => cell.y === End)) return;
    const originals = structuredClone(tetromino.cells);

    for (let i = 0; i < 3; i++) {
        rotate(tetromino)
        if (!collisionDetected(tetromino)) break;
    }

    if (collisionDetected(tetromino)) tetromino.cells = originals;
}
