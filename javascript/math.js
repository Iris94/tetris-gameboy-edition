import { Tetrominos, tetromino, CellHeight, CellWidth, boardMatrix} from "./board.js";

export function randomTetromino() {
     return Tetrominos[Math.floor(Math.random() * Tetrominos.length)];
}

function roundNumber (coordinate, direction) {
     return Math.round(coordinate / direction);
}

export function tetrominoLoop(callback) {

     const loop = [];

     for (let i = 0; i < tetromino.cells.length; i++) {
          let x = tetromino.cells[i].x;
          let y = tetromino.cells[i].y;
          let xn = roundNumber(x, CellWidth);
          let yn = roundNumber(y, CellHeight);
          let color = tetromino.color;

          const cellData = { x, y, xn, yn, color };

          loop.push(cellData);

          loop.push({x: x, y: y, xn: xn, yn: yn, color: color})

          if (callback) {
               callback(cellData)
          }
     }

     return loop;
}

export function boardLoop (callback) {
     for (let i = 0; i < boardMatrix.length; i++) {
          for (let j = 0; j < boardMatrix[i].length; j++) {

               callback(boardMatrix[i][j])

          }
     }
}

