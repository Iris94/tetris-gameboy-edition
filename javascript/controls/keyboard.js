import { pause, resetGameplayInterval, tetromino, pauseEntireGame, gameEngine, menuOpened, switchToKeyboard } from "../engine.js";

document.addEventListener('keydown', async event => {
     if (pause || menuOpened) return;
     if (event.repeat && !['ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.code)) return;
     if (event) switchToKeyboard(true);

     switch (event.code) {
          case 'ArrowDown':
               tetromino.moveDown();
               resetGameplayInterval();
               break;
          case 'ArrowLeft':
               tetromino.moveLeft();
               break;
          case 'ArrowRight':
               tetromino.moveRight();
               break;
          case 'ArrowUp':
               tetromino.calculateRotation();
               break;
          case 'Space':
               await tetromino.shadowMove();
               break;
          case 'Escape':
               pauseEntireGame();
               break;
          default:
               break;
     }

     gameEngine();
});