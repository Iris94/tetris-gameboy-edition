import { boardMatrix, tetromino } from "./board.js";
import { CellWidth } from "./config.js";
import { maxCol, rotateCells } from "./math.js";

let wallkick;

export function rotation() {

     if (tetromino.name == 'O') return;

     wallkick = false;

     rotateCells();

     while (!wallkick) {
          wallkick = true;
          
          tetromino.cells.forEach(cell => {
               let precisePixelX = Math.round(cell.pixelX / CellWidth);

               if (precisePixelX < 0) {
                    tetromino.cells.forEach(cell => cell.pixelX += CellWidth);
                    wallkick = false;
                    return; 
               }

               if (precisePixelX > maxCol()) {
                    tetromino.cells.forEach(cell => cell.pixelX -= CellWidth);
                    wallkick = false;
                    return; 
               }
          });
     }
}              