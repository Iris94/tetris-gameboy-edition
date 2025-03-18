import { Cols, ctx, Rows, sctx } from "../config.js";
import { grid, score } from "../engine.js";
import { playSovietTheme, stopMainTheme } from "../sound.js";
import { clearFilteredRows } from "../updates.js";
import { animateClears } from "./clears.js";
import { specialsIntro } from "./overlay.js";

function getInvasionStrikeData() {
    const occupiedCells = [];

    for (let y = 0; y < Rows; y++) {
        for (let x = 0; x < Cols; x++) {

            if (grid[y][x] === 0) continue;
            occupiedCells.push({x: x, y: y})
        }
    }

    for (let i = occupiedCells.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [occupiedCells[i], occupiedCells[j]] = [occupiedCells[j], occupiedCells[i]];
    }

    return occupiedCells
}

export async function invasionStrike() {
    stopMainTheme(); 
    playSovietTheme();

    await specialsIntro('invasion');
    let targetCells = getInvasionStrikeData();

    await animateClears(targetCells, 'invasion');
    bonusScore += Math.round(score / (200 * targetCells.length));

    await finalizeInvasionStrike(targetCells);
    return targetCells.length;
}

async function finalizeInvasionStrike() {
    const allRows = Array.from({ length: 20 }, (_, i) => i);
    clearFilteredRows(allRows);
    sctx.clearRect(0, 0, special.width, special.height);
    ctx.clearRect(0, 0, canvas.width, canvas.height)
}
