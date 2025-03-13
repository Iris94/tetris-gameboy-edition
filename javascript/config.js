export const canvas = document.querySelector('#canvas');
export const ctx = canvas.getContext("2d", { willReadFrequently: true});

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
export const Cols = 10;
export const Dx = canvas.width / Cols;
export const Dy = canvas.height / Rows;
export const Position = 4;


export const createGrid = () => Array.from({ length: Rows }, () => Array(Cols).fill(0));
export const particlesObjectPool = () => Array.from({ length: 20000 }, () => ({}));
export const tetrominoObjectPool = () => Array.from({ length: 250 }, () => ({}));
export const activeTetrominoPool = () => Array.from({ length: 250 }, () => null);
export const Randomize = (data) => data[Math.floor(Math.random() * data.length)];


export const playGameButton = document.getElementById('start');
export const resumeBtn = document.getElementById('resume');
export const restartBtn = document.getElementById('restart');
export const startBtn = document.getElementById('start');
export const descriptionTxt = document.getElementById('description');
export const gameoverTxt = document.getElementById('gameOver');



export const Ninja = new Image();
Ninja.src = './assets/ninja.png';

export const Invasion = new Image();
Invasion.src = './assets/invasion.png';

export const Artillery = new Image();
Artillery.src = './assets/artillery.png';

export const Riot = new Image();
Riot.src = './assets/riot.png';
