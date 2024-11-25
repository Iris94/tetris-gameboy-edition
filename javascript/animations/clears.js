import { filterRowsData, grid, activeTetrominos, particlesPool, idColorStorage } from "../engine.js";
import { cctx, ctx, Dx, Dy, Cols } from "../config.js";

export function animateClears() {
    for (let y of filterRowsData) {
        for (let x = 0; x < Cols; x++) {

            ctx.strokeStyle = 'rgba(220, 215, 186, 0.1)';
            ctx.fillStyle = '#292929';
            ctx.lineWidth = 1;
            ctx.strokeRect(x * Dx, y * Dy, Dx, Dy);
            ctx.fillRect(x * Dx, y * Dy, Dx, Dy);

            const cellId = grid[y][x];
            const active = activeTetrominos[cellId - 1];

            cellAnimation(active, cellId, y, x, 1000);
        }
    }
}

function cellAnimation(cell, id, y, x, duration) {
    const particles = initiateParticles(x * Dx, y * Dy, id);
    const startTime = performance.now();

    const animation = (currentTime) => {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);

        cctx.globalAlpha = 1 - progress;

        for (let i = 0; i < particles.length; i++) {
            cctx.clearRect(particles[i].x, particles[i].y, particles[i].size, particles[i].size);

            particles[i].x += particles[i].directionX;
            particles[i].y += particles[i].directionY;

            cctx.fillStyle = particles[i].color;
            cctx.fillRect(particles[i].x, particles[i].y, particles[i].size, particles[i].size);
        }

        if (progress < 1) {
            requestAnimationFrame(animation);
        } else {
            cctx.clearRect(0, 0, special.width, special.height);
            cctx.globalAlpha = 1;

            particles.forEach(particle => {
                for (let key in particle) {
                    delete particle[key];
                }
                particlesPool.push(particle);
            });

            particles.length = 0;
        }
    };

    requestAnimationFrame(animation);
}

function initiateParticles(x, y, id) {
    let particles = [];

    const colorPalettes = {
        I: ['#00B5D8', '#00C5E6', '#33D9F1', '#66E3F7', '#99EDF9', '#CCF7FD', '#00A8C7', '#0088A6', '#005F7D', '#004059'],
        J: ['#3D7A8A', '#4A8D9B', '#5DA1AB', '#6EB4BB', '#80C7CB', '#92DADD', '#2F6573', '#1F4F5B', '#123944', '#0A262F'],
        L: ['#D1841B', '#DA912E', '#E39E42', '#EBAB56', '#F4B769', '#F9C285', '#B66F17', '#945B12', '#74460E', '#533109'],
        O: ['#F2D75B', '#F4DC6A', '#F7E27A', '#F9E889', '#FBEF98', '#FDF5A8', '#D4BD4E', '#B5A342', '#968736', '#786A2B'],
        S: ['#76946A', '#849F77', '#93AA84', '#A1B591', '#B0C19E', '#BFDDAA', '#67825C', '#57704E', '#465F40', '#364C32'],
        T: ['#8A5D97', '#9669A2', '#A275AE', '#AD81B9', '#B98DC5', '#C599D1', '#764E81', '#5F3C69', '#482A50', '#321938'],
        Z: ['#C34043', '#CF4C4E', '#DB595A', '#E66666', '#F17272', '#FC7F7F', '#A63437', '#87292C', '#671F22', '#481618'],
    };

    for (let i = 0; i < 200; i++) {

        let lendedParticleObject = particlesPool.pop();
        let startX = x;
        let endX = x + Dx;
        let startY = y;
        let endY = y + Dy;
        let directionX = (Math.random() * 2 - 1);
        let directionY = (Math.random() * 2 - 1);
        let size = Math.random() * 3 + 2;
        let speed = Math.random() * 2 + 0.75;
        let color = colorPalettes[idColorStorage.get(id)]
                    [Math.floor(Math.random() * colorPalettes[idColorStorage.get(id)].length)];

        lendedParticleObject.x = Math.random() * (endX - startX + 1) + startX;
        lendedParticleObject.y = Math.random() * (endY - startY + 1) + startY;
        lendedParticleObject.directionX = directionX * speed;
        lendedParticleObject.directionY = directionY * speed;
        lendedParticleObject.size = size;
        lendedParticleObject.color = color;

        particles.push(lendedParticleObject)
    }

    return particles;
}
