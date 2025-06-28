import { Cols, ctx, dctx, Dx, Dy, End, Rows, Start } from "../config.js";
import { redrawTetrominos } from "../draws.js";
import { tetrominoObjects, grid } from "../engine.js";
import { playMainTheme, playRiotsIntro, playRiotsSirens, stopSovietTheme } from "../sound.js";
import { clearMainBoard, delay, unitType } from "../updates.js";
import { specialsIntro } from "./overlay.js";

export async function riotStrike() {
    let isGridEmpty = true;
    for (let y = End; y >= Start; y--) {
        if (grid[y].some(cell => cell !== 0)) {
            isGridEmpty = false;
            break;
        }
    }
    if (isGridEmpty) return;

    stopSovietTheme();
    playMainTheme();
    playRiotsIntro();
    await delay(100); 
    playRiotsSirens();
    await specialsIntro('riot');

    const { collectPushCells, collectCells } = calculateRiotPush();
    await riotPushAnimation(collectPushCells);
    await delay(200); 
    const pullAnimation = calculateRiotPull();
    await riotPullAnimation(pullAnimation);
    unitType(collectCells);

    return 1;
}

async function riotPushAnimation(data) {
    return new Promise(resolve => {
        dctx.shadowColor = "#1C2526"; 
        dctx.shadowOffsetX = -0.75;
        dctx.shadowOffsetY = -0.75;
        dctx.shadowBlur = 5; 
        dctx.strokeStyle = "#FF4500"; 
        dctx.lineWidth = 1;

        const startTime = performance.now();
        clearMainBoard();

        const animation = (currentTime) => {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / 200, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 2); 

            dctx.clearRect(0, 0, drop.width, drop.height);

            data.forEach(cell => {
                const path = cell.preX + (cell.subX - cell.preX) * easeProgress;
                dctx.fillStyle = cell.color;
                dctx.globalAlpha = 0.8 + Math.sin(progress * Math.PI) * 0.2; 
                dctx.fillRect(path * Dx, cell.initY * Dy, Dx, Dy);
                dctx.strokeRect(path * Dx, cell.initY * Dy, Dx, Dy);
                dctx.globalAlpha = 1;
            });

            if (progress < 1) {
                requestAnimationFrame(animation);
            } else {
                dctx.clearRect(0, 0, drop.width, drop.height);
                redrawTetrominos();
                resolve();
            }
        };

        requestAnimationFrame(animation);
    });
}

async function riotPullAnimation(data) {
    return new Promise(resolve => {
        dctx.shadowColor = "#1C2526"; 
        dctx.shadowOffsetX = -0.75;
        dctx.shadowOffsetY = -0.75;
        dctx.shadowBlur = 5;
        dctx.strokeStyle = "#FF4500"; 
        dctx.lineWidth = 1;
        ctx.shadowColor = 'transparent';
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = 0;

        data.forEach(cell => {
            ctx.clearRect(cell.initX * Dx, cell.preY * Dy, Dx, Dy);
        });

        const startTime = performance.now();

        const animation = (currentTime) => {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / 150, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 2);

            dctx.clearRect(0, 0, drop.width, drop.height);

            data.forEach(cell => {
                const path = cell.preY + (cell.subY - cell.preY) * easeProgress;
                dctx.fillStyle = cell.color;
                dctx.globalAlpha = 0.8 + Math.sin(progress * Math.PI) * 0.2;
                dctx.fillRect(cell.initX * Dx, path * Dy, Dx, Dy);
                dctx.strokeRect(cell.initX * Dx, path * Dy, Dx, Dy);
                dctx.globalAlpha = 1;
            });

            if (progress < 1) {
                requestAnimationFrame(animation);
            } else {
                dctx.clearRect(0, 0, drop.width, drop.height);
                clearMainBoard();
                redrawTetrominos();
                resolve();
            }
        };

        requestAnimationFrame(animation);
    });
}

function calculateRiotPush() {
    const moveRight = Math.random() > 0.5;
    let collectPushCells = [];
    let collectCells = new Set();

    const pushToRight = () => {
        for (let y = End; y >= Start; y--) {
            if (grid[y].every(cell => cell === 0)) break;

            for (let x = Cols - 1; x >= 0; x--) {
                if (grid[y][x] === 0) continue;

                collectCells.add(grid[y][x]);

                let preX = x;
                let subX = x;
                let initY = y;
                let shapeId = grid[y][x];
                let block = tetrominoObjects[shapeId - 1];

                while (x + 1 < Cols && grid[y][x + 1] === 0) {
                    let index = block.cells.findIndex(index => index.x === x && index.y === y);
                    block.cells[index].x += 1;
                    grid[y][x + 1] = block.id;
                    grid[y][x] = 0;
                    x++;
                    subX = x;
                }

                if (preX !== subX) collectPushCells.push({ preX, subX, initY, color: block.color });
            }
        }
    };

    const pushToLeft = () => {
        for (let y = End; y >= Start; y--) {
            if (grid[y].every(cell => cell === 0)) break;

            for (let x = 0; x < Cols; x++) {
                if (grid[y][x] === 0) continue;

                collectCells.add(grid[y][x]);

                let preX = x;
                let subX = x;
                let initY = y;
                let shapeId = grid[y][x];
                let block = tetrominoObjects[shapeId - 1];

                while (x - 1 > -1 && grid[y][x - 1] === 0) {
                    let index = block.cells.findIndex(index => index.x === x && index.y === y);
                    block.cells[index].x -= 1;
                    grid[y][x - 1] = block.id;
                    grid[y][x] = 0;
                    x--;
                    subX = x;
                }

                if (preX !== subX) collectPushCells.push({ preX, subX, initY, color: block.color });
            }
        }
    };

    moveRight ? pushToRight() : pushToLeft();
    return { collectPushCells, collectCells };
}

function calculateRiotPull() {
    let collectPullCells = [];

    for (let y = End - 1; y >= Start; y--) {
        if (grid[y].every(cell => cell === 0)) break;

        for (let x = Cols - 1; x >= 0; x--) {
            if (grid[y][x] === 0) continue;

            let preY = y;
            let subY = y;
            let initX = x;
            let shapeId = grid[y][x];
            let block = tetrominoObjects[shapeId - 1];

            while (y + 1 <= End && grid[y + 1][x] === 0) {
                let index = block.cells.findIndex(index => index.x === x && index.y === y);
                block.cells[index].y += 1;
                grid[y + 1][x] = block.id;
                grid[y][x] = 0;
                y++;
                subY = y;
            }

            if (preY !== subY) collectPullCells.push({ preY, subY, initX, color: block.color });
        }
    }

    return collectPullCells;
}
