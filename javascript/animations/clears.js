import { grid, particlesPool, idColorStorage } from "../engine.js";
import { cctx, ctx, Dx, Dy, Cols, sctx } from "../config.js";

export function animateClears(data, clearName) {
    ctx.shadowColor = 'transparent';
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 0;

    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(220, 215, 186, 0.05)';

    if (clearName === 'invasion') {
        const { x, y } = data;
        clearCell(x, y, clearName);
    }

    else if (clearName === 'artillery') {
        let delay = 0;

        for (let y of data) {
            for (let x = 0; x < Cols; x++) {
                setTimeout(() => {
                    clearCell(x, y, clearName);
                }, delay);
                delay += 100;
            }
        }
    }

    else {
        for (let y of data) {
            for (let x = 0; x < Cols; x++) {
                if (grid[y][x] === 0) continue;
                clearCell(x, y, clearName);
            }
        }
    }
}

function clearCell(x, y, clearName) {
    const padding = 1;

    ctx.clearRect(
        x * Dx - padding,
        y * Dy - padding,
        Dx + padding * 2,
        Dy + padding * 2
    );

    const cellId = grid[y][x];
    cellAnimation(clearName, cellId, y, x, 1000);

    ctx.strokeRect(x * Dx + 0.5, y * Dy + 0.5, Dx - 1, Dy - 1);
    sctx.clearRect(x * Dx, y * Dy, Dx, Dy);
}

function cellAnimation(clearName, id, y, x, duration) {
    const particles = initiateParticles(x * Dx, y * Dy, id, clearName);
    const startTime = performance.now();

    const animation = (currentTime) => {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);

        cctx.globalAlpha = 1 - progress;

        cctx.beginPath();
        for (let i = 0; i < particles.length; i++) {
            cctx.clearRect(particles[i].x, particles[i].y, particles[i].size, particles[i].size);

            particles[i].x += particles[i].directionX;
            particles[i].y += particles[i].directionY;

            cctx.fillStyle = particles[i].color;
            cctx.rect(particles[i].x, particles[i].y, particles[i].size, particles[i].size);
        }
        cctx.fill();

        if (progress < 1) {
            requestAnimationFrame(animation);
        } else {
            cctx.clearRect(0, 0, cctx.canvas.width, cctx.canvas.height);
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

function initiateParticles(x, y, id, clearName) {
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    const maxParticles = isMobile ? 250 : 450;
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

    const fireColors = [
        'hsl(12, 90%, 50%)', 
        'hsl(25, 90%, 60%)',
        'hsl(45, 90%, 55%)', 
        'hsl(60, 90%, 90%)'  
    ];

    const ninjaColors = [
        'hsl(0, 0%, 10%)',
        'hsl(0, 0%, 12%)',
        'hsl(0, 0%, 15%)',
        'hsl(0, 0%, 8%)'
    ];

    const sovietRed = 'hsl(0, 85%, 40%)';

    for (let i = 0; i < maxParticles; i++) {
        let lendedParticleObject = particlesPool.pop();
        let startX = x;
        let endX = x + Dx;
        let startY = y;
        let endY = y + Dy;
        let directionX = (Math.random() * 2 - 1);
        let directionY = (Math.random() * 2 - 1);
        let size = Math.random() * 5;
        let speed = Math.random() * 1.25 + 0.25;

        let color;
        switch (clearName) {
            case 'default':
                color = colorPalettes[idColorStorage.get(id)][Math.floor(Math.random() * colorPalettes[idColorStorage.get(id)].length)];
                break;

            case 'artillery':
                color = fireColors[Math.floor(Math.random() * fireColors.length)];
                break;

            case 'ninja':
                color = ninjaColors[Math.floor(Math.random() * ninjaColors.length)];
                break;

            case 'invasion':
                color = sovietRed;
                break;

            default:
                color = 'white';
                break;
        }

        lendedParticleObject.x = Math.random() * (endX - startX + 1) + startX;
        lendedParticleObject.y = Math.random() * (endY - startY + 1) + startY;
        lendedParticleObject.directionX = directionX * speed;
        lendedParticleObject.directionY = directionY * speed;
        lendedParticleObject.size = size;
        lendedParticleObject.color = color;

        particles.push(lendedParticleObject);
    }

    return particles;
}
