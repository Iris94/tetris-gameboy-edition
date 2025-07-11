export const canvas = document.querySelector('#canvas');
export const ctx = canvas.getContext("2d", { willReadFrequently: true });

export const shadowCanvas = document.querySelector('#shadow');
export const shctx = shadowCanvas.getContext('2d');

export const boardCanvas = document.querySelector('#board');
export const bctx = boardCanvas.getContext('2d');

export const hudCanvas = document.querySelector('#hudCanvas');
export const hctx = hudCanvas.getContext('2d');

export const manaCanvas = document.querySelector('#manaCanvas');
export const mctx = manaCanvas.getContext("2d");

export const special = document.querySelector('#special');
export const sctx = special.getContext("2d");

export const clear = document.querySelector('#clear');
export const cctx = clear.getContext("2d");

export const drop = document.querySelector('#drop');
export const dctx = drop.getContext("2d");

export const overlay = document.querySelector('#overlay');
export const octx = overlay.getContext("2d");

export const ocontent = document.querySelector('#overlayContent');
export const occtx = ocontent.getContext("2d");

canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight

shadowCanvas.width = shadowCanvas.offsetWidth;
shadowCanvas.height = shadowCanvas.offsetHeight

boardCanvas.width = boardCanvas.offsetWidth;
boardCanvas.height = boardCanvas.offsetHeight;

hudCanvas.width = hudCanvas.offsetWidth;
hudCanvas.height = hudCanvas.offsetHeight;

manaCanvas.width = manaCanvas.offsetWidth;
manaCanvas.height = manaCanvas.offsetHeight;

special.width = special.offsetWidth;
special.height = special.offsetHeight;

clear.width = clear.offsetWidth;
clear.height = clear.offsetHeight;

drop.width = drop.offsetWidth;
drop.height = drop.offsetHeight;

overlay.width = overlay.offsetWidth;
overlay.height = overlay.offsetHeight;

ocontent.width = ocontent.offsetWidth;
ocontent.height = ocontent.offsetHeight;

export const Rows = 20;
export const FullRows = 26;
export const Start = 2;
export const End = 22;
export const Cols = 10;
export const Dx = boardCanvas.width / Cols;
export const Dy = boardCanvas.height / Rows;
export const Position = 4;
export const MOBILE_WIDTH_THRESHOLD = 768;

export const createGrid = () => Array.from({ length: FullRows }, () => Array(Cols).fill(0));
export const particlesObjectPool = () => Array.from({ length: 50000 }, () => ({}));
export const tetrominoObjectPool = () => Array.from({ length: 250 }, () => ({}));
export const activeTetrominoPool = () => Array.from({ length: 250 }, () => null);
export const Randomize = (data) => data[Math.floor(Math.random() * data.length)];

export const playGameButton = document.getElementById('start');
export const resumeBtn = document.getElementById('resume');
export const restartBtn = document.getElementById('restart');
export const startBtn = document.getElementById('start');
export const descriptionTxt = document.getElementById('description');
export const gameoverTxt = document.getElementById('gameOver');
export const gameBoard = document.querySelectorAll('.game-board');
export const scoreScreen = document.querySelector('.track-score');
export const levelScreen = document.querySelector('.track-level');
export const scoreTag = document.querySelector('#score-tag');
export const scoreToAdd = document.querySelector('#score-to-add');
export const levelTag = document.querySelector('#level-tag');
export const updatesTag = document.querySelector('#updates-tag');
export const keyboardGuide = document.querySelector('.keyboard-guide');
export const mouseGuide = document.querySelector('.mouse-guide');
export const phoneGuide = document.querySelector('.phone-guide');

gameBoard.forEach(node => {
    node.setAttribute(`height`, `${FullRows * Dy}`);
    node.style.top = `calc(-${3 * Dy}px)`;
});

export const Ninja = new Image();
Ninja.src = './assets/ninja.png';

export const Invasion = new Image();
Invasion.src = './assets/invasion.png';

export const Artillery = new Image();
Artillery.src = './assets/artillery.png';

export const Riot = new Image();
Riot.src = './assets/riot.png';
