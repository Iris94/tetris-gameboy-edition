import { cctx,  Dy, sctx, special } from "../config.js";
import { redrawTetrominos } from "../draws.js";
import { tetrominoObjects, grid, particlesPool } from "../engine.js";
import { playArtilleryBomb, playArtilleryGun, playBombTravel, playClear, playMainTheme, stopSovietTheme } from "../sound.js";
import { clearFilteredRows, shiftFilteredRows, shiftFilteredCols, reconstructGrid, prepareDropCells, collectBlocks } from "../updates.js";
import { animateClears } from "./clears.js";
import { drops } from "./drops.js";
import { specialsIntro } from "./overlay.js";

const lerp = (start, end, t) => start + (end - start) * t;

export async function artilleryStrike() {
    const artilleryTargets = [19, 18, 17, 16];

    stopSovietTheme();
    playMainTheme();    
    await specialsIntro('artillery');

    for (const y of artilleryTargets) {
        await operationArtillery(y);
    }
}

async function operationArtillery(y) {
    const copyTetrominoObjects = structuredClone(tetrominoObjects);

    const { deltaX, deltaY } = await animateBombTravel(y);
    playArtilleryBomb()
    animateShellExplosion(deltaX, deltaY)
    playArtilleryGun();
    await animateClears(y, 'artillery');

    clearFilteredRows([y])
    const collectBlocksData = collectBlocks(y - 1);
    shiftFilteredRows(y);
    shiftFilteredCols(collectBlocksData);

    const dropCellsData = prepareDropCells(copyTetrominoObjects, collectBlocksData);
    let copyGrid = structuredClone(grid);
    reconstructGrid(copyGrid, dropCellsData);
    redrawTetrominos(copyGrid);
    
    playClear();
    await drops(dropCellsData);
}

async function animateBombTravel(target) {
    return new Promise((resolve) => {
        playBombTravel();
        const offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = special.width;
        offscreenCanvas.height = special.height;
        const offscreenCtx = offscreenCanvas.getContext('2d');
        offscreenCtx.globalCompositeOperation = "destination-out";
        offscreenCtx.fillStyle = "rgba(0, 0, 0, 0.05)";
        offscreenCtx.fillRect(0, 0, special.width, special.height);
        offscreenCtx.globalCompositeOperation = "source-over";
        offscreenCtx.strokeStyle = 'rgba(255, 200, 0, 0.5)';
        offscreenCtx.lineWidth = 2;

        const startTime = performance.now();
        const bomb = supportBombParticle(target);

        const animationBombTravel = (currentTime) => {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / 1000, 1);
            const bombArrival = Math.hypot(bomb.deltaX - bomb.x, bomb.deltaY - bomb.y);

            const prevX = bomb.x;
            const prevY = bomb.y;
            bomb.x = lerp(bomb.x, bomb.deltaX, progress);
            bomb.y = lerp(bomb.y, bomb.deltaY, progress);

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

            if (progress < 1 && bombArrival > 2) {
                requestAnimationFrame(animationBombTravel);
            }
            else {
                cctx.clearRect(0, target * Dy, clear.width, Dy);
                sctx.clearRect(0, 0, special.width, special.height);

                resolve({ deltaX: bomb.deltaX, deltaY: bomb.deltaY });
            }
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
            sctx.clearRect(0, 0, special.width, special.height);

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
    let bomb = {};
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