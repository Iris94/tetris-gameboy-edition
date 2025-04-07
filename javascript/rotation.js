import { End } from "./config.js";
import { grid, tetromino } from "./engine.js";

export function shadowRotation(data) {
    while (data.cells.every(cell => cell.y + 1 <= End && grid[cell.y + 1]?.[cell.x] === 0)) {
        data.cells.forEach(cell => cell.y += 1);
    }

    if (data.name === 'O' || !tetromino.shadowSwitch) return;
    let threshold = 0;
    let overrideCells = null;
    let rotationStore = 0;

    const calculateData = (data) => {
        let calculation = 0;
        for (let cell of data.cells) {
            grid[cell.y - 1]?.[cell.x] !== 0 && calculation++;
            grid[cell.y + 1]?.[cell.x] !== 0 && calculation++;
            grid[cell.y]?.[cell.x + 1] !== 0 && calculation++;
            grid[cell.y]?.[cell.x - 1] !== 0 && calculation++;
            grid[cell.y]?.[cell.x + 1] && grid[cell.y]?.[cell.x - 1] && calculation++;
            grid[cell.y + 1]?.[cell.x] && grid[cell.y]?.[cell.x + 1] && grid[cell.y]?.[cell.x - 1] && calculation++;
        }
        return calculation;
    };

    threshold = calculateData(data);

    for (let i = 0; i < 4; i++) {
        let rotationData = 0;
        let shadowCopy = structuredClone(data);

        for (let j = 0; j < i; j++) {
            rotate(shadowCopy);
            const shiftValue = tetromino.cells[2].x - shadowCopy.cells[2].x;
            shadowCopy.cells.forEach(cell => cell.x += shiftValue);
        }

        while (shadowCopy.cells.every(cell => cell.y + 1 <= End && grid[cell.y + 1]?.[cell.x] === 0)) {
            shadowCopy.cells.forEach(cell => cell.y += 1);
        }

        if (collisionDetected(shadowCopy)) continue;

        rotationData = calculateData(shadowCopy);
        if (rotationData <= threshold) continue;
        threshold = rotationData;
        overrideCells = shadowCopy.cells;
        rotationStore = i;
    }

    if (overrideCells) data.cells = overrideCells;
    if (tetromino.shadowSwitch) matchTetrominoWithShadow(rotationStore);
}

function matchTetrominoWithShadow(data) {
    for (let i = 0; i < data; i++) {
        rotate(tetromino);
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
