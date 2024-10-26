import { boardMatrix, nextTetromino, Rows } from "./board.js";
import { tetrominoLoop } from "./math.js";

export let leftStop;
export let rightStop;

export function watchguard() {
     leftStop = false;
     rightStop = false;

     tetrominoLoop(cell => {

          let x = cell.xn;
          let y = cell.yn;
          let bottomWall = Rows - 1;
          let leftWall = Rows - Rows;
          let rightWall = (Rows / 2) - 1;

          if (y < 0 || y >= Rows || x < 0 || x >= boardMatrix[y].length) {
               return; 
           }

          if (x === leftWall || boardMatrix[y][x-1] !== null) {
               leftStop = true;
          }

          if (x === rightWall || boardMatrix[y][x+1] !== null) {
               rightStop = true;
          }

          if (y === bottomWall) {
               nextTetromino();
               return;
          }

          if (y < bottomWall && boardMatrix[y+1][x] !== null) {
               nextTetromino();
               return;
          }
     });
}

