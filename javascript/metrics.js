import { tetrominoObjectPool, Randomize } from "./config.js";
import { level, nextTetromino, scoreBonus, tetrominosArray } from "./engine.js";

export const calculateCollisionScore = () => level * scoreBonus;
export const calculateClearingScore = (data) => ((level + level) * scoreBonus) * (data** 2);

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
          default:
               linesClearedBonus = 0;
               break;
     }

     return linesClearedBonus;
}

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


