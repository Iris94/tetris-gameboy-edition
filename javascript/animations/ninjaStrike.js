import { Randomize, sctx, Rows, Cols, Dx, Dy, ctx, Ninja, octx, occtx, ocontent } from "../config.js";
import { tetrominosArray, grid, activeTetrominos, score } from "../engine.js";
import { playClear, playMainTheme, playNinjaSlice, stopSovietTheme } from "../sound.js";
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
    stopSovietTheme();
    playMainTheme();
    
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

async function finalizeNinjaStrike() {
    let localCopiedActiveTetromino;

    localCopiedActiveTetromino = deepCopy(activeTetrominos);
    updateGridWithFilteredRows();
    playClear();
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
            playNinjaSlice();
            sctx.beginPath();
            sctx.moveTo(cell.x * Dx - 21, cell.y * Dy + 13);
            sctx.lineTo((cell.x * Dx) + (Dx + 21), cell.y * Dy + 4);
            sctx.strokeStyle = 'black';
            sctx.lineWidth = 5;
            sctx.shadowColor = 'hsl(0, 85%, 50%)';
            sctx.shadowBlur = 7;
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
