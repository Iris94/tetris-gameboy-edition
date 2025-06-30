import { cctx, Dy, sctx, special } from "../config.js";
import { redrawTetrominos } from "../draws.js";
import { tetrominoObjects, grid, particlesPool, getSpecialsScore } from "../engine.js";
import { artilleryBonus } from "../metrics.js";
import { playArtilleryBomb, playArtilleryGun, playArtilleryOutro, playArtilleryTarget, playBombTravel, playClear, playMainTheme, stopSovietTheme } from "../sound.js";
import { clearFilteredRows, shiftFilteredRows, shiftFilteredCols, reconstructGrid, prepareDropCells, collectBlocks } from "../updates.js";
import { animateClears } from "./clears.js";
import { drops } from "./drops.js";
import { specialsIntro } from "./overlay.js";

export async function artilleryStrike() {
    const clearedCells = 40;
    const artilleryTargets = [22, 21, 20, 19];

    let value =  artilleryBonus(clearedCells);
    getSpecialsScore({value: value, perCell: value, cells: clearedCells});

    stopSovietTheme();
    playMainTheme();
    playArtilleryTarget();

    await specialsIntro('artillery');
    for (const y of artilleryTargets) {
        await operationArtillery(y);
    }

    playArtilleryOutro();
    return clearedCells;
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
    return new Promise(resolve => {
        playBombTravel();
        const bomb = supportBombParticle(target);
        const startTime = performance.now();

        const animation = (currentTime) => {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / 250, 1);

            sctx.clearRect(0, 0, special.width, special.height);

            const currentX = bomb.x + progress * (bomb.deltaX - bomb.x);
            const currentY = bomb.y + progress * (bomb.deltaY - bomb.y);

            sctx.lineWidth = 2;
            sctx.globalAlpha = 1 - progress;
            sctx.strokeStyle = 'hsla(20, 91%, 47%, 1)';
            sctx.beginPath();
            sctx.moveTo(bomb.x, bomb.y);
            sctx.lineTo(currentX, currentY);
            sctx.stroke();

            sctx.globalAlpha = 1;
            sctx.beginPath();
            sctx.arc(currentX, currentY, 7, 0, 2 * Math.PI);
            sctx.fillStyle = 'hsla(33, 100%, 50%, 1)';
            sctx.shadowColor = '#fff';
            sctx.shadowBlur = 2;
            sctx.fill();

            if (progress < 1) {
                requestAnimationFrame(animation);
            } else {
                sctx.shadowBlur = 0;
                sctx.clearRect(0, 0, special.width, special.height);
                resolve({ deltaX: bomb.deltaX, deltaY: bomb.deltaY });
                for (let key in bomb) {
                    delete bomb[key];
                }
                particlesPool.push(bomb);
            }
        };

        requestAnimationFrame(animation);
    });
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

            if (elapsedTime < Math.max(...shells.map((shell) => shell.duration))) {
                requestAnimationFrame(animateExplosion);
            }
            else {
                shells.forEach((shell) => {
                    for (let key in shell) {
                        delete shell[key];
                    }
                    particlesPool.push(shell);
                });
                sctx.clearRect(0, 0, special.width, special.height);
                resolve();
            }

        };

        requestAnimationFrame(animateExplosion);
    });
}

function supportBombShells(x, y) {
    let shells = [];

    for (let i = 0; i < 50; i++) {
        let shellParticle = particlesPool.pop() || {};

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
    let lendedParticleObject = particlesPool.pop() || {};

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