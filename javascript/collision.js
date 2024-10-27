import { boardMatrix } from "./board.js";
import { maxCol, maxRow, tetrominoLoop } from "./math.js";
import { setCollisionDetected, setLeftWallDetected, setRightWallDetected } from "./config.js";


export function collision() {
     
     setLeftWallDetected(false);
     setRightWallDetected(false);

     tetrominoLoop((pixelX, pixelY, gridX, gridY) => {

          if (gridY === maxRow()) {
               setCollisionDetected(true);
               return;
          }

          if (boardMatrix[gridY + 1][gridX] !== null) {
               setCollisionDetected(true);
               return;
          }

          if (gridX === 0 || boardMatrix[gridY][gridX - 1] !== null) {
               setLeftWallDetected(true);
          }

          if (gridX === maxCol() || boardMatrix[gridY][gridX + 1] !== null) {
               setRightWallDetected(true);
          }

     });

}

