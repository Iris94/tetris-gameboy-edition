import { grid, particlesPool, idColorStorage } from "../engine.js";
import { cctx, ctx, Dx, Dy, Cols, sctx } from "../config.js";

export function animateClears(data, clearName) {
    ctx.shadowColor = 'transparent';
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 0;

    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(185, 184, 176, 0.05)';

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
        I: ['#00FFFF', '#33FFFF', '#66FFFF', '#99FFFF', '#CCFFFF', '#00EFFF', '#00CFFF', '#00AFFF', '#008FFF', '#007FFF'],
        J: ['#00CED1', '#33D6DB', '#66DEE4', '#99E6EE', '#CCEEF7', '#00BFC3', '#009EA3', '#007E83', '#005E63', '#003E43'],
        L: ['#FFA500', '#FFB533', '#FFC566', '#FFD599', '#FFE5CC', '#E68A00', '#CC7A00', '#B36B00', '#995C00', '#804D00'],
        O: ['#FFFF00', '#FFFF33', '#FFFF66', '#FFFF99', '#FFFFCC', '#E6E600', '#CCCC00', '#B3B300', '#999900', '#808000'],
        S: ['#32CD32', '#5DE65D', '#88FF88', '#B3FFB3', '#DFFFDF', '#28A428', '#208020', '#186018', '#104010', '#082008'],
        T: ['#DA70D6', '#E57BE3', '#F086F0', '#FB91FB', '#FFA8FF', '#C060C1', '#A050A0', '#804080', '#603060', '#402040'],
        Z: ['#FF4500', '#FF5733', '#FF6A66', '#FF7D99', '#FF90CC', '#E63E00', '#CC3500', '#B32D00', '#992500', '#801D00'],
    };

    const fireColors = [
        'hsl(12, 100%, 60%)',
        'hsl(25, 100%, 70%)',
        'hsl(45, 100%, 65%)',
        'hsl(60, 100%, 90%)'
    ];

    const ninjaColors = [
        'hsl(0, 0%, 20%)',
        'hsl(0, 0%, 25%)',
        'hsl(0, 0%, 30%)',
        'hsl(0, 0%, 15%)'
    ];

    const sovietRed = 'hsl(0, 85%, 50%)';

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
