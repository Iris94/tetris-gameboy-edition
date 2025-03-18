import { sctx, Rows, Cols, Dx, Dy } from "../config.js";
import { redrawTetrominos } from "../draws.js";
import { grid, tetrominoObjects } from "../engine.js";
import { playMainTheme, playNinjaSlice, stopSovietTheme } from "../sound.js";
import { reconstructGrid, clearSingularCells, collectBlocks, prepareDropCells, shiftFilteredCols, unitType } from "../updates.js";
import { drops } from "./drops.js";
import { specialsIntro } from "./overlay.js";

function getDataNinjaStrike() {
    let ninjaCells = [];
    let ninjaIds = new Set();
    let singularCellsToClear = new Set();

    for (let y = Rows - 1; y >= 0; y--) {
        if (grid[y].every(cell => cell === 0)) break;

        for (let x = 0; x < Cols; x++) {
            if (grid[y][x] === 0) continue
            if (Math.random() < 0.8) continue

            ninjaCells.push({ x, y });
            ninjaIds.add(grid[y][x]);

            let blockId = grid[y][x];
            grid[y][x] = 0

            let block = tetrominoObjects[blockId - 1];
            let index = block.cells.findIndex(cell => cell.x === x && cell.y === y);
            block.cells.splice(index, 1);

            block.cells.length === 0
                && singularCellsToClear.add(blockId);
        }
    }

    singularCellsToClear.forEach(id => ninjaIds.delete(id))

    return { ninjaCells, ninjaIds, singularCellsToClear };
}

export async function ninjaStrike() {
    stopSovietTheme();
    playMainTheme();

    await specialsIntro('ninja');
    const ninjaScore = await operationNinja();
    return ninjaScore;
}

async function operationNinja() {
    const copyTetrominoObjects = structuredClone(tetrominoObjects);
    const { ninjaCells, ninjaIds, singularCellsToClear } = getDataNinjaStrike();

    singularCellsToClear.length > 0
        && clearSingularCells(singularCellsToClear);

    unitType(ninjaIds);
    await animateStrike(ninjaCells);
    const collectBlocksData = collectBlocks(18);
    shiftFilteredCols(collectBlocksData);

    const dropCellsData = prepareDropCells(copyTetrominoObjects, collectBlocksData);
    let copyGrid = structuredClone(grid);
    reconstructGrid(copyGrid, dropCellsData)
    redrawTetrominos(copyGrid)

    await drops(dropCellsData);
    return ninjaCells.length;
}

async function animateStrike(ninjaCells) {
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = special.width;
    offscreenCanvas.height = special.height;
    const offctx = offscreenCanvas.getContext('2d');

    for (let slice of ninjaCells) {
        playNinjaSlice();
        await sliceAnimation(slice, offctx, offscreenCanvas);
    }

    await sliceFadeOut(ninjaCells, offscreenCanvas);
}

async function sliceFadeOut(ninjaCells, offscreenCanvas) {
    return new Promise(resolve => {
        const startTime = performance.now();

        const animation = (currentTime) => {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / 1000, 1);

            sctx.clearRect(0, 0, special.width, special.height);
            sctx.globalAlpha = 1 - progress;
            sctx.drawImage(offscreenCanvas, 0, 0);

            sctx.globalAlpha = 1;
            sctx.fillStyle = `rgba(21, 21, 21, ${progress})`;

            ninjaCells.forEach(cell => {
                sctx.fillRect(cell.x * Dx, cell.y * Dy, Dx, Dy);
            });

            if (progress < 1) {
                requestAnimationFrame(animation);
            }
            else {
                sctx.clearRect(0, 0, special.width, special.height);
                resolve();
            }
        }

        requestAnimationFrame(animation);
    })

}

async function sliceAnimation(slice, offctx, offscreenCanvas) {
    return new Promise(resolve => {
        const startTime = performance.now();

        const animation = (currentTime) => {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / 150, 1);

            offctx.beginPath();
            offctx.moveTo(slice.x * Dx - 10, slice.y * Dy + 20);
            offctx.lineTo((slice.x * Dx) + (Dx + 10), slice.y * Dy + 1);
            offctx.strokeStyle = 'cyan';
            offctx.lineWidth = 1;
            offctx.shadowColor = 'magenta';
            offctx.shadowBlur = 2;
            offctx.stroke();

            sctx.drawImage(offscreenCanvas, 0, 0);

            if (progress < 1) {
                requestAnimationFrame(animation)
            }
            else {
                resolve()
            }
        }

        requestAnimationFrame(animation)
    })
}
