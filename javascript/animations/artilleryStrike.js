import { cctx, Cols, Dy, Randomize, Rows, sctx, special } from "../config.js";
import { activeTetrominos, copiedActiveTetromino, grid, idColorStorage, particlesPool, score } from "../engine.js";
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
    let targetsAcquired = true;
    let bonusScore = 0;

    artilleryTargets.length === 0 ? targetsAcquired = false : null;

    await specialsIntro('artillery', targetsAcquired);
    
    if (!targetsAcquired) {
        completed(false);
        return;
    }

    artilleryStrikeAnimation(artilleryTargets, (bonusIncrement) => {
        bonusScore += bonusIncrement;
    }, () => {
        finalizeArtilleryStrike(artilleryTargets);
        completed(true, bonusScore); 
    });
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

function artilleryStrikeAnimation(artilleryTargets, bonusScore, finalCallback) {
    let particleFlightDuration = 1400;
    let clearTimeOffset = 1700;
    let totalDurationPerRow = particleFlightDuration * 3;
    let totalParticles = 30;
    let particleDelay = particleFlightDuration / totalParticles;

    artilleryTargets.forEach((target, index) => {
        const startTimeForRow = index * particleFlightDuration;

        setTimeout(() => {
            animateRow(target, totalDurationPerRow, particleFlightDuration, totalParticles, particleDelay);
            bonusScore(Math.round(score / 30));
        }, startTimeForRow);

        setTimeout(() => {
            animateClears([target], 'artillery');
        }, startTimeForRow + clearTimeOffset);
    });

    const finalEndTime = (artilleryTargets.length * particleFlightDuration) + particleFlightDuration;

    setTimeout(() => {
        finalCallback();
    }, finalEndTime);
}


function animateRow(target, totalDurationPerRow, particleFlightDuration, totalParticles, particleDelay) {
    const startTime = performance.now();

    const colors = {
        emberDark: { h: 10, s: 66, l: 11, a: 1 },
        emberRed: { h: 6, s: 84, l: 25, a: 1 },
        deepOrange: { h: 20, s: 91, l: 47, a: 1 },
        brightOrange: { h: 33, s: 100, l: 50, a: 1 },
        hotYellow: { h: 44, s: 100, l: 50, a: 1 },
        whiteHot: { h: 50, s: 100, l: 89, a: 1 }
    };

    const particles = initiateArtillery(colors, target, Dy, particleDelay, particleFlightDuration, totalParticles);

    function animationProcess(currentTime) {
        const elapsedTime = currentTime - startTime;

        particles.forEach((particle, index) => {
            const particleElapsed = currentTime - (startTime + particle.delay);
            if (particleElapsed < 0) return;

            const particleProgress = Math.min(particleElapsed / particle.travelTime, 1);

            const oldX = particle.x;
            const oldY = particle.y;

            let dx = particle.destinationX - particle.x;
            let dy = particle.destinationY - particle.y;

            const distance = Math.hypot(dx, dy);

            sctx.clearRect(oldX - 10, oldY - 10, 20, 20);

            particle.x = lerp(particle.startX, particle.destinationX, particleProgress);
            particle.y = lerp(particle.startY, particle.destinationY, particleProgress);

            sctx.beginPath();
            sctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
            sctx.fillStyle = particle.color;
            sctx.fill();
            sctx.closePath();

            if (distance < 2) {
                sctx.clearRect(particle.x - 10, particle.y - 10, 20, 20);

                const shells = initiateShells(particle, colors);
                animateShells(shells, totalParticles);

                for (let key in particle) {
                    delete particle[key];
                }
                particlesPool.push(particle);
                particles.splice(index, 1);
            }
        });

        if (elapsedTime < totalDurationPerRow) {
            requestAnimationFrame(animationProcess);
        }
    }

    requestAnimationFrame(animationProcess);
}

function initiateArtillery(colors, targetRow, Dy, particleDelay, particleFlightDuration, totalParticles) {
    const particles = [];
    const rowTopY = targetRow * Dy;

    for (let i = 0; i < totalParticles; i++) {
        let lendedParticleObject = particlesPool.pop();

        const destinationX = Math.random() * special.width;
        const destinationY = rowTopY + Math.random() * Dy;

        const color = `hsla(${colors.whiteHot.h}, ${colors.whiteHot.s}%, ${colors.whiteHot.l}%, 1)`;

        lendedParticleObject.startX = Math.random() * special.width;
        lendedParticleObject.startY = -5;
        lendedParticleObject.destinationX = destinationX;
        lendedParticleObject.destinationY = destinationY;
        lendedParticleObject.color = color;
        lendedParticleObject.delay = i * particleDelay;
        lendedParticleObject.travelTime = particleFlightDuration;

        particles.push(lendedParticleObject);
    }

    return particles;
}

function initiateShells(particle, colors) {
    const particles = [];

    for (let i = 0; i < 9; i++) {
        let shellParticle = particlesPool.pop();

        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 1.5;

        shellParticle.x = particle.destinationX;
        shellParticle.y = particle.destinationY;

        shellParticle.vx = Math.cos(angle) * speed;
        shellParticle.vy = Math.sin(angle) * speed;

        const coreColorOptions = [
            colors.whiteHot,
            colors.hotYellow,
            colors.brightOrange
        ];

        const shadowColorOptions = [
            colors.emberDark,
            colors.emberRed,
            colors.deepOrange
        ];

        const coreColor = coreColorOptions[Math.floor(Math.random() * coreColorOptions.length)];
        const shadowColor = shadowColorOptions[Math.floor(Math.random() * shadowColorOptions.length)];

        shellParticle.coreColor = coreColor;
        shellParticle.shadowColor = shadowColor;

        particles.push(shellParticle);
    }

    return particles;
}

function animateShells(particles, totalParticles) {
    const startTime = performance.now();

    function animationProcess(currentTime) {
        const elapsedTime = currentTime - startTime;

        let count = 0;
        const intervalId = setInterval(() => {
            cctx.clearRect(0, 0, clear.width, clear.height);
            count++;

            if (count >= totalParticles) {
                clearInterval(intervalId);
            }
        }, 300);

        particles.forEach((particle, index) => {
            particle.x += particle.vx;
            particle.y += particle.vy;

            const lifetimeProgress = Math.min(elapsedTime / 750, 1);

            const coreLightness = particle.coreColor.l - (particle.coreColor.l * lifetimeProgress);
            const shadowLightness = particle.shadowColor.l - (particle.shadowColor.l * lifetimeProgress);

            const adjustedShadowBlur = 20 * (1 - lifetimeProgress);

            const particleAlpha = 1 - lifetimeProgress;

            cctx.beginPath();
            cctx.shadowBlur = adjustedShadowBlur;
            cctx.shadowColor = `hsla(${particle.shadowColor.h}, ${particle.shadowColor.s}%, ${shadowLightness}%, ${particleAlpha})`;
            cctx.arc(particle.x, particle.y, 7, 0, Math.PI * 2);
            cctx.fillStyle = `hsla(${particle.shadowColor.h}, ${particle.shadowColor.s}%, ${shadowLightness}%, ${particleAlpha})`;
            cctx.fill();
            cctx.closePath();

            cctx.beginPath();
            cctx.shadowBlur = 0;
            cctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
            cctx.fillStyle = `hsla(${particle.coreColor.h}, ${particle.coreColor.s}%, ${coreLightness}%, ${particleAlpha})`;
            cctx.fill();
            cctx.closePath();

            if (lifetimeProgress >= 1) {
                for (let key in particle) {
                    delete particle[key];
                }
                particlesPool.push(particle);
                particles.splice(index, 1);
            }
        });

        if (particles.length > 0) {
            requestAnimationFrame(animationProcess);
        }
    }

    requestAnimationFrame(animationProcess);
}