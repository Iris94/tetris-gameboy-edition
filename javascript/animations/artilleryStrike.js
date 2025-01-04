import { cctx, Cols, Dy, Randomize, Rows, sctx, special } from "../config.js";
import { activeTetrominos, grid, particlesPool, score } from "../engine.js";
import { clearFilteredRows, deepCopy, shiftFilteredRows, updateGridWithFilteredRows, updateTetrominoInfoByRow } from "../updates.js";
import { animateClears } from "./clears.js";
import { drops } from "./drops.js";
import { specialsIntro } from "./overlay.js";

const lerp = (start, end, t) => start + (end - start) * t;

function getDataArtilleryStrike() {
    const tetrominoShapes = ['O', 'I', 'T', 'S', 'Z', 'L', 'J'];

    let artilleryTarget = Randomize(tetrominoShapes);
    let rowsToStrike = new Set();

    for (let y = Rows - 1; y >= 0; y--) {
        if (grid[y].every(cell => cell === 0)) break;

        for (let x = 0; x < Cols; x++) {
            if (grid[y][x] === 0) continue;

            if (activeTetrominos[grid[y][x] - 1].name === artilleryTarget) {
                rowsToStrike.add(y);
                break;
            }
        }
    }
    return rowsToStrike;
}

export async function artilleryStrike(completed) {
    const artilleryTargets = [...getDataArtilleryStrike()];
    const delay = 1000;
    let targetsAcquired = true;
    let bonusScore = 0;

    artilleryTargets.length === 0 ? (targetsAcquired = false) : null;

    await specialsIntro('artillery', targetsAcquired);

    if (!targetsAcquired) {
        completed(false);
        return;
    }

    const animationsOrder = artilleryTargets.map((target, index) => {
        return new Promise((resolve) => {
            initiateTargets(artilleryTargets).then(() => {
                setTimeout(() => {
                    animateBombTravel(target, delay).then(() => {
                        bonusScore += Math.round(score / 30);
                        resolve();
                    });
                }, index * delay);
            });
        });
    });

    await Promise.all(animationsOrder);

    finalizeArtilleryStrike(artilleryTargets);
    completed(true, bonusScore);
}


async function finalizeArtilleryStrike(artilleryTargets) {
    let localIdColorStorage;
    let localCopiedActiveTetromino;

    let targetRow = artilleryTargets[artilleryTargets.length - 1];
    localIdColorStorage = updateTetrominoInfoByRow(artilleryTargets);
    localCopiedActiveTetromino = deepCopy(activeTetrominos);

    clearFilteredRows(artilleryTargets);
    artilleryTargets.sort((a, b) => a - b)
    shiftFilteredRows(artilleryTargets);
    updateGridWithFilteredRows();
    await drops(targetRow, localCopiedActiveTetromino);
}

function initiateTargets(artilleryTargets) {
    return new Promise((resolve) => {
        const startTime = performance.now();

        const animationTargetsMark = (currentTime) => {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / 2000, 1);

            cctx.clearRect(0, 0, clear.width, clear.height)
            cctx.beginPath();
            cctx.fillStyle = `rgba(255, 0, 0, ${progress / 5})`;

            artilleryTargets.forEach(target => {
                cctx.fillRect(0, target * Dy, clear.width, Dy)
            })

            cctx.fill();
            cctx.restore();

            progress < 1
                ? requestAnimationFrame(animationTargetsMark)
                : resolve();
        }

        requestAnimationFrame(animationTargetsMark)
    })
}

function animateBombTravel(target, delay) {
    return new Promise((resolve) => {
        const startTime = performance.now();
        const bomb = supportBombParticle(target);

        const offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = special.width;
        offscreenCanvas.height = special.height;
        const offscreenCtx = offscreenCanvas.getContext('2d');

        const animationBombTravel = (currentTime) => {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / delay, 1);
            const bombArrival = Math.hypot(bomb.deltaX - bomb.x, bomb.deltaY - bomb.y);

            offscreenCtx.globalCompositeOperation = "destination-out";
            offscreenCtx.fillStyle = "rgba(0, 0, 0, 0.05)";
            offscreenCtx.fillRect(0, 0, special.width, special.height);

            offscreenCtx.globalCompositeOperation = "source-over";

            const prevX = bomb.x;
            const prevY = bomb.y;
            bomb.x = lerp(bomb.x, bomb.deltaX, progress);
            bomb.y = lerp(bomb.y, bomb.deltaY, progress);

            offscreenCtx.strokeStyle = 'rgba(255, 200, 0, 0.5)';
            offscreenCtx.lineWidth = 2;
            offscreenCtx.beginPath();
            offscreenCtx.moveTo(prevX, prevY);
            offscreenCtx.lineTo(bomb.x, bomb.y);
            offscreenCtx.stroke();

            sctx.clearRect(0, 0, special.width, special.height);

            sctx.drawImage(offscreenCanvas, 0, 0);

            const fire = sctx.createRadialGradient(bomb.x, bomb.y, 0, bomb.x, bomb.y, 10);
            fire.addColorStop(0, 'hsla(50, 100%, 89%, 1)');
            fire.addColorStop(0.3, 'hsla(44, 100%, 50%, 1)');
            fire.addColorStop(0.5, 'hsla(33, 100%, 50%, 1)');
            fire.addColorStop(0.7, 'hsla(20, 91%, 47%, 1)');
            fire.addColorStop(0.9, 'hsla(6, 84%, 25%, 1)');
            fire.addColorStop(1, 'hsla(10, 66%, 11%, 1)');

            sctx.fillStyle = fire;
            sctx.beginPath();
            sctx.arc(bomb.x, bomb.y, 7, 0, Math.PI * 2);
            sctx.fill();

            (progress < 1 && bombArrival > 2)
                ? requestAnimationFrame(animationBombTravel)
                : (
                    cctx.clearRect(0, target * Dy, clear.width, Dy),
                    sctx.clearRect(0, 0, special.width, special.height),
                    animateShellExplosion(bomb.deltaX, bomb.deltaY).then(resolve),
                    animateClears([target], 'artillery')
                )
        };

        requestAnimationFrame(animationBombTravel);
    })
}

function animateShellExplosion(targetX, targetY) {
    return new Promise((resolve) => {
        const shells = supportBombShells(targetX, targetY);

        const offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = special.width;
        offscreenCanvas.height = special.height;
        const offscreenCtx = offscreenCanvas.getContext('2d');

        const startTime = performance.now();

        const animateExplosion = (currentTime) => {
            const elapsedTime = currentTime - startTime;

            offscreenCtx.globalCompositeOperation = "destination-out";
            offscreenCtx.fillStyle = "rgba(0, 0, 0, 0.1)";
            offscreenCtx.fillRect(0, 0, special.width, special.height);

            offscreenCtx.globalCompositeOperation = "source-over";

            shells.forEach((shell) => {
                const progress = Math.min(elapsedTime / (shell.duration / 5), 1);

                shell.x += shell.deltaX;
                shell.y += shell.deltaY;

                const alpha = 1 - progress;
                offscreenCtx.fillStyle = `hsla(50, 100%, 89%, ${alpha})`;
                offscreenCtx.beginPath();
                offscreenCtx.arc(shell.x, shell.y, 2, 0, Math.PI * 2);
                offscreenCtx.fill();
            });

            sctx.clearRect(0, 0, special.width, special.height);
            sctx.drawImage(offscreenCanvas, 0, 0);

            elapsedTime < Math.max(...shells.map((shell) => shell.duration))
                ? requestAnimationFrame(animateExplosion)
                : (
                    shells.forEach((shell) => {
                        for (let key in shell) {
                            delete shell[key];
                        }
                        particlesPool.push(shell); 
                    }),
                    sctx.clearRect(0, 0, special.width, special.height),
                    resolve()
                );

        };

        requestAnimationFrame(animateExplosion);
    });
}

function supportBombShells(x, y) {
    let shells = [];

    for (let i = 0; i < 50; i++) {
        let shellParticle = particlesPool.pop();

        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 1.5 + 0.5;
        const duration = Math.random() * 1500 + 1500;

        shellParticle.x = x;
        shellParticle.y = y;
        shellParticle.deltaX = Math.cos(angle) * velocity;
        shellParticle.deltaY = Math.sin(angle) * velocity;
        shellParticle.duration = duration;

        shells.push(shellParticle);
    }

    return shells;
}

function supportBombParticle(target) {
    let bomb;
    let lendedParticleObject = particlesPool.pop();

    const x = canvas.width * Math.random();
    const y = 0;
    const deltaX = Math.random() * special.width;
    const deltaY = (target * Dy) + (Math.random() * Dy);

    lendedParticleObject.x = x;
    lendedParticleObject.y = y;
    lendedParticleObject.deltaX = deltaX;
    lendedParticleObject.deltaY = deltaY;

    bomb = lendedParticleObject;
    return bomb
}