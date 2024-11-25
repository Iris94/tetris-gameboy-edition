import { Randomize, sctx, Rows, Cols, Dx, Dy, ctx, Ninja, octx, occtx, ocontent } from "../config.js";
import { tetrominosArray, grid, activeTetrominos } from "../engine.js";

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

export function ninjaStrike(completed) {
    ninjaStrikeIntro(() => {
        ninjaStrikeAnimation(completed);
    });
}

function ninjaStrikeIntro(completed) {
    const img = new Image();
    img.src = './assets/ninjas.png';

    const textOptions = [
        'We are here to serve',
        'The shadows are your ally.',
        'Silence is your weapon.'
    ];

    img.onload = () => {
        sctx.clearRect(0, 0, special.width, special.height);
        const randomText = textOptions[Math.floor(Math.random() * textOptions.length)];
        let startPosition = special.width * 2;

        function screenOverlay() {
            octx.fillStyle = 'rgba(0, 0, 0, 0.75)';
            octx.fillRect(0, 0, overlay.width, overlay.height);
        }

        function animateImage() {
            if (startPosition > ocontent.width * 0.25) {
                startPosition -= 30;

                occtx.clearRect(0, 0, ocontent.width, ocontent.height);
                occtx.drawImage(img, startPosition, 0, special.width + (special.width * 0.75), special.height);

                requestAnimationFrame(animateImage);
            } else {
                showText();
            }
        }

        function showText() {
            screenOverlay();
            occtx.font = '1rem Gill Sans';
            occtx.fillStyle = 'whitesmoke';
            occtx.fillText(randomText, 15, ocontent.height / 10, ocontent.width);

            setTimeout(() => {
                removeTextAndMoveImage();
            }, 2000);
        }

        function removeTextAndMoveImage() {
            function animateOut() {
                startPosition += 30;

                if (startPosition > special.width + 200) {
                    octx.clearRect(0, 0, overlay.width, overlay.height);
                    completed();
                } else {
                    occtx.clearRect(0, 0, ocontent.width, ocontent.height);
                    occtx.drawImage(img, startPosition, 0, special.width + (special.width * 0.75), special.height);
                    requestAnimationFrame(animateOut);
                }
            }
            animateOut();
        }

        animateImage();
    };
}



function ninjaStrikeAnimation(completed) {
    const ninjaTargets = getDataNinjaStrike();
    const targetLocations = [];

    ninjaTargets.forEach(target => {
        activeTetrominos[target - 1].cells.forEach(cell => {
            targetLocations.push({ x: cell.x, y: cell.y });
        });
    });

    targetLocations.forEach((cell, index) => {
        setTimeout(() => {
            sctx.beginPath();
            sctx.moveTo(cell.x * Dx - 21, cell.y * Dy + 13);
            sctx.lineTo((cell.x * Dx) + (Dx + 21), cell.y * Dy + 4);
            sctx.strokeStyle = 'black';
            sctx.lineWidth = 3;
            sctx.shadowColor = 'crimson';
            sctx.shadowBlur = 11;
            sctx.stroke();
        }, index * 150);
    });

    setTimeout(() => {
        animation(targetLocations, 1000, completed);
    }, targetLocations.length * 100);
}


function animation(coordinates, duration, completed) {
    const startTime = performance.now();

    function animationProcess(currentTime) {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);

        sctx.clearRect(0, 0, special.width, special.height);

        coordinates.forEach(({ x, y }) => {
            sctx.beginPath();
            sctx.moveTo(x * Dx - 12, y * Dy + 13);
            sctx.lineTo((x * Dx) + (Dx + 12), y * Dy + 4);
            sctx.strokeStyle = `rgba(0, 0, 0, ${1 - progress})`;
            sctx.lineWidth = 5;
            sctx.shadowColor = 'red';
            sctx.shadowBlur = 10;
            sctx.stroke();

            ctx.clearRect(x * Dx - 1, y * Dy - 1, Dx + 3, Dy + 3)

            ctx.strokeStyle = 'rgba(220, 215, 186, 0.1)';
            ctx.strokeRect(x * Dx, y * Dy, Dx, Dy);
        });

        if (progress < 1) {
            requestAnimationFrame(animationProcess);
        } else {
            sctx.clearRect(0, 0, special.width, special.height);
            completed();
        }
    }

    requestAnimationFrame(animationProcess);
}



