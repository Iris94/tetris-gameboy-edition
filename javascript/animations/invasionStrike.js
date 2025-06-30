import { Cols, ctx, End, FullRows, sctx, Start } from "../config.js";
import { getSpecialsScore, grid } from "../engine.js";
import { invasionBonus } from "../metrics.js";
import { playInvasionIntro, playSovietTheme, stopMainTheme } from "../sound.js";
import { clearFilteredRows } from "../updates.js";
import { animateClears } from "./clears.js";
import { specialsIntro } from "./overlay.js";

function getInvasionStrikeData() {
    const occupiedCells = [];

    for (let y = Start; y <= End; y++) {
        for (let x = 0; x < Cols; x++) {

            if (grid[y][x] === 0) continue;
            occupiedCells.push({x: x, y: y})
        }
    }

    for (let i = occupiedCells.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [occupiedCells[i], occupiedCells[j]] = [occupiedCells[j], occupiedCells[i]];
    }

    return occupiedCells;
}

export async function invasionStrike() {
    let targetCells = getInvasionStrikeData();
    if (targetCells.length === 0) return;

    let value = invasionBonus(targetCells.length);
    getSpecialsScore({value: value, perCell: value, cells: targetCells.length}); 

    stopMainTheme(); 
    playSovietTheme();
    playInvasionIntro();
    await specialsIntro('invasion');

    await animateClears(targetCells, 'invasion');
    await finalizeInvasionStrike(targetCells);
    return targetCells.length;
}

async function finalizeInvasionStrike() {
    const allRows = Array.from({ length: FullRows }, (_, i) => i);
    clearFilteredRows(allRows);
    sctx.clearRect(0, 0, special.width, special.height);
    ctx.clearRect(0, 0, canvas.width, canvas.height)
}
