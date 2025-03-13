import { Cols, Rows } from "../config.js";
import { activeTetrominos, grid } from "../engine.js";
import { playMainTheme, stopSovietTheme } from "../sound.js";
import { specialsIntro } from "./overlay.js";

function getDataRiotStrike() {
    const copiedActiveTetromino = structuredClone(activeTetrominos);
    const copiedActiveGrid = structuredClone(grid);
    let riotCells = [];

    for (let y = Rows - 1; y >= 0; y--) {
        for (let x = 0; x < Cols; x++) {
            if (grid[y][x] === 0) continue;
            riotCells.push({ shapeId: grid[y][x], y: y, x: x })
        }
    }

    return { copiedActiveTetromino, copiedActiveGrid, riotCells }
}

export async function riotStrike(completed) {
    stopSovietTheme();
    playMainTheme();

    const { copiedActiveTetromino, copiedActiveGrid, riotCells } = getDataRiotStrike();

    await specialsIntro('riot', true);
    await calculateRiots(copiedActiveTetromino, copiedActiveGrid, riotCells);
}

async function calculateRiots(copiedActiveTetromino, copiedActiveGrid, riotCells) {

}