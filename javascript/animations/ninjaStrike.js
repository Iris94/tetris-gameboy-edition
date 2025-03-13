import { Randomize, sctx, Rows, Cols, Dx, Dy, ctx } from "../config.js";
import { grid, activeTetrominos, score, collectDropCells, dropCellsData, clearPhase } from "../engine.js";
import { playClear, playMainTheme, playNinjaSlice, stopSovietTheme } from "../sound.js";
import { checkForClears, checkForRedraws, clearSet, clearSingularCells, prepareDropCells, shiftFilteredCols } from "../updates.js";
import { drops } from "./drops.js";
import { specialsIntro } from "./overlay.js";

function getDataNinjaStrike() {
    const tetrominoShapes = ['O', 'I', 'T', 'S', 'Z', 'L', 'J'];

    let ninjaTarget = Randomize(tetrominoShapes);
    let collectTargets = new Set();
    let targetRowUpdated = false;
    let targetRow = Rows - 1;

    for (let y = Rows - 1; y >= 0; y--) {
        if (grid[y].every(cell => cell === 0)) break;

        for (let x = 0; x < Cols; x++) {
            if (grid[y][x] === 0) continue

            if (activeTetrominos[grid[y][x] - 1].name === ninjaTarget) {
                collectTargets.add(grid[y][x]);
                if (!targetRowUpdated) {
                    targetRowUpdated = true;
                    targetRow = y;
                }
            } else if (targetRowUpdated) {
                collectDropCells.add(grid[y][x]);
            }
        }
    }

    return { collectTargets, targetRow };
}

export async function ninjaStrike(completed) {
    stopSovietTheme();
    playMainTheme();

    const { collectTargets, targetRow } = getDataNinjaStrike();
    let targetsAcquired = true;
    let bonusScore = 0;

    collectTargets.length === 0 ? targetsAcquired = false : null;

    await specialsIntro('ninja', targetsAcquired);

    if (!targetsAcquired) {
        completed(false);
        return;
    }

    await ninjaStrikeAnimation([...collectTargets], (bonusIncrement) => {
        bonusScore += bonusIncrement;
    });

    await finalizeNinjaStrike([...collectTargets], targetRow);
    completed(true, bonusScore);
}

async function finalizeNinjaStrike(ninjaTargets, targetRow) {
    let filterRowsData = [];
    const copiedActiveTetromino = structuredClone(activeTetrominos);
    const copiedActiveGrid = structuredClone(grid);

    clearSingularCells(ninjaTargets);
    shiftFilteredCols();
    checkForRedraws(targetRow, copiedActiveGrid);

    dropCellsData.push(...prepareDropCells(copiedActiveTetromino));
    clearSet(collectDropCells);

    playClear();
    await drops(dropCellsData);

    filterRowsData.push(...checkForClears());
    filterRowsData.length > 0
        ? await clearPhase()
        : null
}

function ninjaStrikeAnimation(ninjaTargets, bonusScore) {
    const targetLocations = [];

    ninjaTargets.forEach(target => {
        activeTetrominos[target - 1].cells.forEach(cell => {
            targetLocations.push({ x: cell.x, y: cell.y });
        });
    });

    ctx.shadowColor = 'transparent';
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 0;
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(185, 184, 176, 0.05)';

    targetLocations.forEach((cell, index) => {
        setTimeout(() => {
            playNinjaSlice();
            sctx.beginPath();
            sctx.moveTo(cell.x * Dx - 21, cell.y * Dy + 13);
            sctx.lineTo((cell.x * Dx) + (Dx + 21), cell.y * Dy + 4);
            sctx.strokeStyle = 'black';
            sctx.lineWidth = 5;
            sctx.shadowColor = 'hsl(0, 85%, 50%)';
            sctx.shadowBlur = 7;
            sctx.stroke();
            ctx.clearRect(cell.x * Dx, cell.y * Dy, Dx, Dy);
            ctx.strokeRect(cell.x * Dx, cell.y * Dy, Dx, Dy);
        }, index * 150);
    });

    return new Promise(resolve => {
        setTimeout(() => {
            animation(targetLocations, 1000, resolve);
            bonusScore(Math.round(score / 50));
        }, targetLocations.length * 100);
    });
}

function animation(coordinates, duration, completed) {
    const startTime = performance.now();

    function animationProcess(currentTime) {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);

        sctx.clearRect(0, 0, special.width, special.height);

        const dx = Dx;
        const dy = Dy;
        const shadowBlur = 10;
        const strokeStyle = `rgba(0, 0, 0, ${1 - progress})`;

        coordinates.forEach(({ x, y }) => {
            const startX = x * dx;
            const startY = y * dy;

            sctx.beginPath();
            sctx.moveTo(startX - 12, startY + 13);
            sctx.lineTo(startX + dx + 12, startY + 4);
            sctx.strokeStyle = strokeStyle;
            sctx.lineWidth = 5;
            sctx.shadowColor = 'red';
            sctx.shadowBlur = shadowBlur;
            sctx.stroke();
        });


        progress < 1
            ? requestAnimationFrame(animationProcess)
            : (
                sctx.clearRect(0, 0, special.width, special.height),
                completed()
            );
    }

    requestAnimationFrame(animationProcess);
}
