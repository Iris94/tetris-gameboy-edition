import { tetrominoObjectPool, Randomize, scoreTag, levelTag, updatesTag } from "./config.js";
import { level, nextTetromino, clearMultiplier, tetrominosArray, score } from "./engine.js";

export const calculateCollisionScore = () => level * clearMultiplier;
export const calculateClearingScore = (data) => ((level + level) * clearMultiplier) * (data** 2);
export const artilleryBonus = (data) => ({ value: Math.max(Math.ceil(score / 100), 10), cells: data });
export const ninjaBonus = (data) => ({ value: Math.max(Math.ceil(score / 100), 10), cells: data });
export const invasionBonus = (data) => ({ value: Math.max(Math.ceil(score / 50), 10), cells: data });
export const riotBonus = (data) => ({ value: Math.max(Math.ceil(score / 200), 10), cells: data });
export const updateScore = () => scoreTag.textContent = score;
export const updateLevel = () => levelTag.textContent = level;

export function calculateLevel (data) {
     let linesClearedBonus = 0;

     switch (data) {
          case 1:
               linesClearedBonus = 1;
               break;
          case 2:
               linesClearedBonus = 3;
               break;
          case 3:
               linesClearedBonus = 5;
               break;
          case 4:
               linesClearedBonus = 8;
               break;
          default:
               linesClearedBonus = 0;
               break;
     }

     return linesClearedBonus;
}

// export function updateSpecialsVisual (valueData) {
//      let span = document.createElement('div');
//      span.classList.add('temp');
//      span.classList.add('start');
//      span.textContent = valueData;
//      updatesScreen.appendChild(span)

//      setTimeout(() => {
//           updatesScreen.removeChild(span)
//      }, 2500);
// }

export function lendObject () {
     const object = tetrominoObjectPool.find(o => o.id === null);
     if (object) {
          object.id = tetrominoId;
     }
}

export function randomTetromino () {
     let drawedTetromino = Randomize(tetrominosArray);
     if (drawedTetromino.name !== nextTetromino.name) return drawedTetromino;

     Math.random() < 0.85 && (drawedTetromino = Randomize(tetrominosArray));
     return drawedTetromino;
}
