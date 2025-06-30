import { sctx, Cols, Dx, Dy, End, Start, special } from "../config.js";
import { redrawTetrominos } from "../draws.js";
import { specials, getSpecialsScore, grid, tetrominoObjects, updateSpecialsScore } from "../engine.js";
import { ninjaBonus } from "../metrics.js";
import { playMainTheme, playNinjaIntro, playNinjaOutro, playNinjaSlice, stopSovietTheme } from "../sound.js";
import { reconstructGrid, clearSingularCells, collectBlocks, prepareDropCells, shiftFilteredCols, unitType } from "../updates.js";
import { drops } from "./drops.js";
import { specialsIntro } from "./overlay.js";

const offscreenCanvas = document.createElement('canvas');
offscreenCanvas.width = special.width;
offscreenCanvas.height = special.height;
const offctx = offscreenCanvas.getContext('2d');

function getDataNinjaStrike() {
    let ninjaCells = [];
    let ninjaIds = new Set();
    let singularCellsToClear = new Set();

    for (let y = End; y > Start; y--) {
        if (grid[y].every(cell => cell === 0)) break;

        for (let x = 0; x < Cols; x++) {
            if (grid[y][x] === 0) continue
            if (Math.random() < Math.random()) continue

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
    const { ninjaCells, ninjaIds, singularCellsToClear } = getDataNinjaStrike();
    if (ninjaCells.length === 0) return 0;

    let value = ninjaBonus(ninjaCells.length);
    getSpecialsScore({value: value, perCell: value, cells: ninjaCells.length});

    stopSovietTheme();
    playMainTheme();
    playNinjaIntro();

    await specialsIntro('ninja');
    const ninjaScore = await operationNinja({ ninjaCells, ninjaIds, singularCellsToClear });

    playNinjaOutro();
    return ninjaScore
}

async function operationNinja({ ninjaCells, ninjaIds, singularCellsToClear }) {
    const copyTetrominoObjects = structuredClone(tetrominoObjects);
    console.log(specials)

    singularCellsToClear.length > 0
        && clearSingularCells(singularCellsToClear);

    unitType(ninjaIds);
    await animateStrike(ninjaCells);
    const collectBlocksData = collectBlocks(End - 1);
    shiftFilteredCols(collectBlocksData);

    const dropCellsData = prepareDropCells(copyTetrominoObjects, collectBlocksData);
    let copyGrid = structuredClone(grid);
    reconstructGrid(copyGrid, dropCellsData)
    redrawTetrominos(copyGrid)

    await drops(dropCellsData);
    return ninjaCells.length;
}

async function animateStrike(ninjaCells) {
    offctx.clearRect(0, 0, special.width, special.height);

    for (let slice of ninjaCells) {
        playNinjaSlice();
        updateSpecialsScore();
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

        const direction = Math.floor(Math.random() * 4);
        let startX, startY, endX, endY;
        const offset = 1;

        switch (direction) {
            case 0:
                startX = slice.x * Dx + offset;
                startY = slice.y * Dy + offset;
                endX = slice.x * Dx + Dx - offset;
                endY = slice.y * Dy + Dy - offset;
                break;
            case 1:
                startX = slice.x * Dx + offset;
                startY = slice.y * Dy + Dy - offset;
                endX = slice.x * Dx + Dx - offset;
                endY = slice.y * Dy + offset;
                break;
            case 2:
                startX = slice.x * Dx + Dx - offset;
                startY = slice.y * Dy + offset;
                endX = slice.x * Dx + offset;
                endY = slice.y * Dy + Dy - offset;
                break;
            case 3:
                startX = slice.x * Dx + Dx - offset;
                startY = slice.y * Dy + Dy - offset;
                endX = slice.x * Dx + offset;
                endY = slice.y * Dy + offset;
                break;
        }

        const animation = (currentTime) => {
            const elapsedTime = (currentTime - startTime) / 150;
            const progress = Math.min(elapsedTime, 1);

            offctx.clearRect(slice.x * Dx, slice.y * Dy, Dx, Dy);
            offctx.beginPath();
            offctx.moveTo(startX, startY);
            offctx.lineTo(
                startX + (endX - startX) * progress,
                startY + (endY - startY) * progress
            );
            offctx.strokeStyle = '#ff4500';
            offctx.lineWidth = 1 + progress;
            offctx.shadowColor = '#1c2526';
            offctx.shadowBlur = 1.5;
            offctx.stroke();

            sctx.drawImage(offscreenCanvas, 0, 0);

            if (progress < 1) {
                requestAnimationFrame(animation);
            } else {
                resolve();
            }
        };

        requestAnimationFrame(animation);
    });
}
