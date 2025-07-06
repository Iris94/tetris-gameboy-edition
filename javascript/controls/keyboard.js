import { keyboardGuide, mouseGuide, phoneGuide } from "../config.js";
import { pause, resetGameplayInterval, tetromino, pauseEntireGame, gameEngine, menuOpened, switchToKeyboard } from "../engine.js";

document.addEventListener('keydown', async event => {
     if (pause || menuOpened) return;
     if (event.repeat && !['ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.code)) return;
     if (event) switchToKeyboard(true);
     keyboardControls();

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

function keyboardControls () {
     keyboardGuide.classList.add('show');
     keyboardGuide.classList.remove('hide');
     phoneGuide.classList.add('hide');
     phoneGuide.classList.remove('show');
     mouseGuide.classList.add('hide');
     mouseGuide.classList.remove('show');
}