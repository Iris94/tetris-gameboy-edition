import { tetromino } from "./board.js";

export function rotation() {
     if (tetromino.name == 'O') return;
     let centerX = tetromino.cells[2].x; 
     let centerY = tetromino.cells[2].y;
          
     tetromino.cells.forEach(cell => {

          let dx = cell.x - centerX;
          let dy = cell.y - centerY;

          let newX = centerX - dy;
          let newY = centerY + dx;

          cell.x = newX;
          cell.y = newY;
     });
}

