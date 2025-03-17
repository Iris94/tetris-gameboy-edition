import { Randomize, sctx, Rows, Cols, Dx, Dy, ctx } from "../config.js";
import { grid, tetrominoObjects, score, collectDropCells, dropCellsData, clearPhase } from "../engine.js";
import { playClear, playMainTheme, playNinjaSlice, stopSovietTheme } from "../sound.js";
import { checkForClears, checkForRedraws, clearSingularCells, prepareDropCells, shiftFilteredCols, unitType } from "../updates.js";
import { drops } from "./drops.js";
import { specialsIntro } from "./overlay.js";

function getDataNinjaStrike() {
    let ninjaCells = [];
    let ninjaIds = new Set();
    let singularCellsToClear = new Set();

    for (let y = Rows - 1; y >= 0; y--) {
        if (grid[y].every(cell => cell === 0)) break;

        for (let x = 0; x < Cols; x++) {
            if (grid[y][x] === 0) continue
            if (Math.random() < 0.8) continue

            ninjaCells.push({ x, y });
            ninjaIds.add(grid[y][x]);

            let blockId = grid[y][x];
            grid[y][x] = 0

            let block = tetrominoObjects[blockId - 1];
            let index = block.cells.findIndex(cell => cell.x === x && cell.y === y);
            block.cells.splice(index, 1);

            block.cells.length === 0
                && singularCellsToClear.add(cell);
        }
    }

    singularCellsToClear.forEach(id => ninjaIds.delete(id))

    return { ninjaCells, ninjaIds, singularCellsToClear };
}

export async function ninjaStrike() {
    stopSovietTheme();
    playMainTheme();

    await specialsIntro('ninja');
    const ninjaScore = await operationNinja();

    return ninjaScore;
}

async function operationNinja() {
    const copyTetrominoObjects = structuredClone(tetrominoObjects);
    const copyGrid = structuredClone(grid);
    const { ninjaCells, ninjaIds, singularCellsToClear } = getDataNinjaStrike();

    singularCellsToClear.length > 0
        && clearSingularCells(singularCellsToClear);

    unitType(ninjaIds);
    await animateStrike(ninjaCells)

}

async function animateStrike(ninjaCells) {
    for (let slice of ninjaCells) {
        playNinjaSlice();
        await sliceAnimation(slice);
    }

    await sliceFadeOut(ninjaCells);
}

async function sliceFadeOut(ninjaCells) {
    return new Promise(resolve => {
        const startTime = performance.now();

        const animation = (currentTime) => {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / 3000, 1);

            ninjaCells.forEach(cell => {
                ctx.clearRect(cell.x * Dx, cell.y * Dy, Dx, Dy);
                ctx.strokeRect(cell.x * Dx, cell.y * Dy, Dx, Dy);
            })

            sctx.globalAlpha = 1 - progress;

            if (progress < 1) {
                requestAnimationFrame(animation);
            }
            else {
               sctx.clearRect(0, 0, special.width, special.height);
               resolve();
            }
        }

        requestAnimationFrame(animation);
    })

}

async function sliceAnimation(slice) {
    return new Promise(resolve => {
        const startTime = performance.now();

        const animation = (currentTime) => {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / 200, 1);

            // sctx.beginPath();
            // sctx.moveTo(slice.x * Dx - 21, slice.y * Dy + 13);
            // sctx.lineTo((slice.x * Dx) + (Dx + 21), slice.y * Dy + 4);
            // sctx.strokeStyle = 'black';
            // sctx.lineWidth = 2;
            // sctx.shadowColor = 'hsl(0, 85%, 50%)';
            // sctx.shadowBlur = 3;
            // sctx.stroke();

            if (progress < 1) {
                requestAnimationFrame(animation)
            }
            else {
                resolve()
            }
        }

        requestAnimationFrame(animation)
    })
}

// async function ninjaStrikeAnimation(ninjaTargets, bonusScore) {
//     const targetLocations = [];

//     ninjaTargets.forEach(target => {
//         tetrominoObjects[target - 1].cells.forEach(cell => {
//             targetLocations.push({ x: cell.x, y: cell.y });
//         });
//     });

//     ctx.shadowColor = 'transparent';
//     ctx.shadowOffsetX = 0;
//     ctx.shadowOffsetY = 0;
//     ctx.shadowBlur = 0;
//     ctx.lineWidth = 1;
//     ctx.strokeStyle = 'rgba(185, 184, 176, 0.05)';

//     targetLocations.forEach((cell, index) => {
//         setTimeout(() => {
//             playNinjaSlice();
//             sctx.beginPath();
//             sctx.moveTo(cell.x * Dx - 21, cell.y * Dy + 13);
//             sctx.lineTo((cell.x * Dx) + (Dx + 21), cell.y * Dy + 4);
//             sctx.strokeStyle = 'black';
//             sctx.lineWidth = 5;
//             sctx.shadowColor = 'hsl(0, 85%, 50%)';
//             sctx.shadowBlur = 7;
//             sctx.stroke();
//             ctx.clearRect(cell.x * Dx, cell.y * Dy, Dx, Dy);
//             ctx.strokeRect(cell.x * Dx, cell.y * Dy, Dx, Dy);
//         }, index * 150);
//     });

//     return new Promise(resolve => {
//         setTimeout(() => {
//             animation(targetLocations, 1000, resolve);
//             bonusScore(Math.round(score / 50));
//         }, targetLocations.length * 100);
//     });
// }

// function animation(coordinates, duration, completed) {
//     const startTime = performance.now();

//     function animationProcess(currentTime) {
//         const elapsedTime = currentTime - startTime;
//         const progress = Math.min(elapsedTime / duration, 1);

//         sctx.clearRect(0, 0, special.width, special.height);

//         const dx = Dx;
//         const dy = Dy;
//         const shadowBlur = 10;
//         const strokeStyle = `rgba(0, 0, 0, ${1 - progress})`;

//         coordinates.forEach(({ x, y }) => {
//             const startX = x * dx;
//             const startY = y * dy;

//             sctx.beginPath();
//             sctx.moveTo(startX - 12, startY + 13);
//             sctx.lineTo(startX + dx + 12, startY + 4);
//             sctx.strokeStyle = strokeStyle;
//             sctx.lineWidth = 5;
//             sctx.shadowColor = 'red';
//             sctx.shadowBlur = shadowBlur;
//             sctx.stroke();
//         });


//         progress < 1
//             ? requestAnimationFrame(animationProcess)
//             : (
//                 sctx.clearRect(0, 0, special.width, special.height),
//                 completed()
//             );
//     }

//     requestAnimationFrame(animationProcess);
// }
