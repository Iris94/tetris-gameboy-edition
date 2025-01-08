import { Cols, ctx, Dx, Dy, Rows, sctx } from "../config.js";
import { activeTetrominos, grid, particlesPool, reuseObjectIdArray, score } from "../engine.js";
import { playArtilleryBomb, playSovietTheme, stopMainTheme } from "../sound.js";
import { clearFilteredRows } from "../updates.js";
import { animateClears } from "./clears.js";
import { specialsIntro } from "./overlay.js";

function getInvasionStrikeData() {
    const occupiedCells = [];

    for (let y = 0; y < Rows; y++) {
        for (let x = 0; x < Cols; x++) {

            if (grid[y][x] === 0) continue;

            let lendedParticleObject = particlesPool.pop();
            lendedParticleObject.y = y;
            lendedParticleObject.x = x;

            occupiedCells.push(lendedParticleObject)
        }
    }

    for (let i = occupiedCells.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [occupiedCells[i], occupiedCells[j]] = [occupiedCells[j], occupiedCells[i]];
    }

    return occupiedCells
}

export async function invasionStrike(onComplete) {
    stopMainTheme(); 
    playSovietTheme();

    await specialsIntro('invasion', true);
    let targetCells = getInvasionStrikeData();
    let bonusScore = 0;

    invasionStrikeAnimation(targetCells, () => {
        let animationsCompleted = 0;

        targetCells.forEach((target, index) => {
            setTimeout(() => {

                playArtilleryBomb();
                animateClears(target, 'invasion')
                animationsCompleted++;
                bonusScore += Math.round(score / 200);

                animationsCompleted === targetCells.length
                    ? (finalizeInvasionStrike(targetCells), onComplete(bonusScore))
                    : null

            }, index * 200);
        })
    })
}

function finalizeInvasionStrike(targetCells) {
    const allRows = Array.from({ length: 21 }, (_, i) => i);
    clearFilteredRows(allRows);

    for (let i = 0; i < activeTetrominos.length; i++) {
        const active = activeTetrominos[i];

        if (active === null) continue;

        reuseObjectIdArray.push(active.id)

        for (let key in active) {
            delete active[key];
        }
    }

    targetCells.forEach(target => {
        for (let key in target) {
            delete target[key];
        }
        particlesPool.push(target)
    })

    sctx.clearRect(0, 0, special.width, special.height);
    ctx.clearRect(0, 0, canvas.width, canvas.height)
}

function invasionStrikeAnimation(targetCells, completed) {
    const startTime = performance.now();

    const animation = (currentTime) => {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / 3500, 1);

        sctx.clearRect(0, 0, special.width, special.height);

        targetCells.forEach(cell => {
            const opacity = progress;
            sctx.fillStyle = `rgba(255, 0, 0, ${opacity / 2})`;
            sctx.fillRect(cell.x * Dx, cell.y * Dy, Dx, Dy);
        });

        progress < 1
            ? requestAnimationFrame(animation)
            : completed()
    };

    requestAnimationFrame(animation);
}

