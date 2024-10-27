import { boardMatrix, tetromino } from "./board.js";
import { CellWidth } from "./config.js";

export function rotation() {
     if (tetromino.name == 'O') return;
     let centerX = tetromino.cells[2].x; 
     let centerY = tetromino.cells[2].y;
     let wallkick = false;
          
     tetromino.cells.forEach(cell => {

          let dx = cell.x - centerX;
          let dy = cell.y - centerY;

          let newX = centerX - dy;
          let newY = centerY + dx;

          cell.x = newX;
          cell.y = newY;


          console.log(cell.x / CellWidth)

          if ((cell.x / CellWidth > 9)) {
               console.log('test')
          }
     });


     // while (!wallkick) {
     //      wallkick = true;
          
     //      let leftWallKick = tetromino.cells.some(cell => cell.x < (-1));
     //      let rightWallKick = tetromino.cells.some(cell => cell.x > (canvas.width + 1));
     
     //      if (leftWallKick) {
     //           tetromino.cells.forEach(cell => cell.x += CellWidth);
     //           wallkick = false; 
     //      }
     
     //      else if (rightWallKick) {
     //           tetromino.cells.forEach(cell => cell.x -= CellWidth);
     //           wallkick = false; 
     //      }
     // }
}