import { Randomize, sctx, Rows, Cols, Dx, Dy, ctx, Ninja, octx, occtx, ocontent } from "../config.js";
import { tetrominosArray, grid, activeTetrominos, score } from "../engine.js";
import { deepCopy, updateGridWithFilteredRows, updateTetrominoInfoByCol } from "../updates.js";
import { drops } from "./drops.js";
import { specialsIntro } from "./overlay.js";

function getDataNinjaStrike() {
    const tetrominoShapes = ['O', 'I', 'T', 'S', 'Z', 'L', 'J'];

    let ninjaTarget = Randomize(tetrominoShapes);
    let collectTargets = new Set();

    for (let y = Rows - 1; y >= 0; y--) {
        if (grid[y].every(cell => cell === 0)) break;

        for (let x = 0; x < Cols; x++) {
            if (grid[y][x] === 0) continue

            activeTetrominos[grid[y][x] - 1].name === ninjaTarget
                ? collectTargets.add(grid[y][x])
                : null;
        }
    }

    return collectTargets;
}

export async function ninjaStrike(completed) {
    const ninjaTargets = [...getDataNinjaStrike()];
    let targetsAcquired = true;
    let bonusScore = 0;

    ninjaTargets.length === 0 ? targetsAcquired = false : null;

    await specialsIntro('ninja', targetsAcquired);

    if (!targetsAcquired) {
        completed(false);
        return;
    }

    ninjaStrikeAnimation(ninjaTargets, (bonusIncrement) => {
        bonusScore += bonusIncrement;
    }, () => {
        finalizeNinjaStrike();
        completed(true, bonusScore);
    });
}

async function finalizeNinjaStrike () {
    let localCopiedActiveTetromino;

    localCopiedActiveTetromino = deepCopy(activeTetrominos);
    updateGridWithFilteredRows();
    await drops(Rows - 1, localCopiedActiveTetromino)
}

function ninjaStrikeAnimation(ninjaTargets, bonusScore, completed) {
    const targetLocations = [];

    ninjaTargets.forEach(target => {
        activeTetrominos[target - 1].cells.forEach(cell => {
            targetLocations.push({ x: cell.x, y: cell.y });
        });
        updateTetrominoInfoByCol(target)
    });

    targetLocations.forEach((cell, index) => {
        setTimeout(() => {
            sctx.beginPath();
            sctx.moveTo(cell.x * Dx - 21, cell.y * Dy + 13);
            sctx.lineTo((cell.x * Dx) + (Dx + 21), cell.y * Dy + 4);
            sctx.strokeStyle = 'black';
            sctx.lineWidth = 3;
            sctx.shadowColor = 'crimson';
            sctx.shadowBlur = 11;
            sctx.stroke();
        }, index * 150);
    });

    setTimeout(() => {
        animation(targetLocations, 1000, completed);
        bonusScore(Math.round(score / 50))
    }, targetLocations.length * 100);
}

function animation(coordinates, duration, completed) {
    const startTime = performance.now();

    function animationProcess(currentTime) {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);

        sctx.clearRect(0, 0, special.width, special.height);

        coordinates.forEach(({ x, y }) => {
            sctx.beginPath();
            sctx.moveTo(x * Dx - 12, y * Dy + 13);
            sctx.lineTo((x * Dx) + (Dx + 12), y * Dy + 4);
            sctx.strokeStyle = `rgba(0, 0, 0, ${1 - progress})`;
            sctx.lineWidth = 5;
            sctx.shadowColor = 'red';
            sctx.shadowBlur = 10;
            sctx.stroke();

            ctx.clearRect(x * Dx - 1, y * Dy - 1, Dx + 3, Dy + 3)

            ctx.strokeStyle = 'rgba(220, 215, 186, 0.1)';
            ctx.strokeRect(x * Dx, y * Dy, Dx, Dy);
        });

        if (progress < 1) {
            requestAnimationFrame(animationProcess);
        } else {
            sctx.clearRect(0, 0, special.width, special.height);
            completed();
        }
    }

    requestAnimationFrame(animationProcess);
}

