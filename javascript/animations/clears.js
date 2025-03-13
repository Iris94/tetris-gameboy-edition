import { activeTetrominos, grid, particlesPool } from "../engine.js";
import { cctx, ctx, Dx, Dy, Cols, sctx, clear } from "../config.js";
import { playArtilleryBomb } from "../sound.js";

export function animateClears(data, clearName) {
    return new Promise(async (resolve) => {

        if (clearName === 'invasion') {
            await invasionCall();
        } else if (clearName === 'artillery') {
            await artilleryCall();
        } else {
            await defaultCall();
        }

        resolve();
    });

    async function invasionCall() {
        let delay = 0;
        let promises = [];

        data.forEach(cell => {
            promises.push(new Promise(res => {
                setTimeout(async () => {
                    await clearCell([{ x: cell.x * Dy, y: cell.y * Dy, clearName }]);
                    playArtilleryBomb();
                    ctx.clearRect(cell.x * Dx, cell.y * Dy, Dx, Dy);
                    ctx.strokeRect(cell.x * Dx, cell.y * Dy, Dx, Dy);
                    res();
                }, delay);
            }));
            delay += 200;
        })

        await Promise.all(promises);
    }

    async function artilleryCall() {
        let delay = 0;
        let promises = [];

        for (let y of data) {
            for (let x = 0; x < Cols; x++) {
                promises.push(new Promise(res => {
                    setTimeout(async () => {
                        await clearCell([{ x: x * Dy, y: y * Dy, clearName }]);
                        ctx.clearRect(x * Dx, y * Dy, Dx, Dy);
                        ctx.strokeRect(x * Dx, y * Dy, Dx, Dy);
                        res();
                    }, delay);
                }));
                delay += 100;
            }
        }

        await Promise.all(promises);
    }

    async function defaultCall() {
        let cellsToClear = [];

        for (let y of data) {
            for (let x = 0; x < Cols; x++) {
                if (grid[y][x] === 0) continue;
                let active = activeTetrominos[grid[y][x] - 1];
                let _cellName = active.name;
                cellsToClear.push({ x: x * Dy, y: y * Dy, clearName, _cellName });
            }
        }

        await clearCell(cellsToClear);
    }
}

async function clearCell(data) {
    return new Promise(resolve => {
        ctx.shadowColor = 'transparent';
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = 0;
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(185, 184, 176, 0.05)';

        let clearFlag = true;
        let particlesData = [];
        data.forEach(cell => {

            ctx.clearRect(cell.x * Dx - 1, cell.y * Dy - 1, Dx + 1 * 2, Dy + 1 * 2);
            ctx.strokeRect(cell.x * Dx + 0.5, cell.y * Dy + 0.5, Dx - 1, Dy - 1);
            sctx.clearRect(cell.x * Dx, cell.y * Dy, Dx, Dy);

            particlesData.push(initiateParticles(cell))
        });

        const startTime = performance.now();

        const animation = (currentTime) => {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / 750, 1);

            for (let i = 0; i < particlesData.length; i++) {
                for (let j = 0; j < particlesData[i].length; j++) {
                    let particle = particlesData[i][j];

                    particle.x += particle.directionX;
                    particle.y += particle.directionY;

                    cctx.fillStyle = particle.color;
                    cctx.fillRect(particle.x, particle.y, particle.size, particle.size);
                }
            }

            cctx.globalCompositeOperation = "destination-in";
            cctx.fillStyle = `rgba(250, 250, 250, ${1 - progress})`;
            cctx.fillRect(0, 0, clear.width, clear.height);
            cctx.globalCompositeOperation = "source-over"

            progress > 0.1 && clearFlag
                ? (clearFlag = false, resolve())
                : null;

            if (progress < 1) {
                requestAnimationFrame(animation);
            } else {
                cctx.clearRect(0, 0, cctx.canvas.width, cctx.canvas.height);
                particlesData.forEach(cell => {
                    cell.forEach(particle => {
                        Object.assign(particle, { x: 0, y: 0, directionX: 0, directionY: 0, size: 0, color: '' });
                        particlesPool.push(particle);
                    });
                });

                particlesData.length = 0;
                console.log(particlesPool.length)
            }
        };

        requestAnimationFrame(animation);
    })
}

function initiateParticles(data) {
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    const maxParticles = isMobile ? 250 : 500;
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
        let startX = data.x;
        let endX = data.x + Dx;
        let startY = data.y;
        let endY = data.y + Dy;
        let directionX = (Math.random() * 2 - 1);
        let directionY = (Math.random() * 2 - 1);
        let size = Math.random() * 5;
        let speed = Math.random() * 1.25 + 0.25;
        let color;

        switch (data.clearName) {
            case 'default':
                color = colorPalettes[data._cellName][Math.floor(Math.random() * colorPalettes[data._cellName].length)];
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
