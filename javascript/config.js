export const CANVAS = document.querySelector('#canvas');
export const CTX = canvas.getContext("2d", { willReadFrequently: true });

export const HUD_CANVAS = document.querySelector('#hudCanvas');
export const HUD_CTX = HUD_CANVAS.getContext('2d', { willReadFrequently: true });

canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

hudCanvas.width = hudCanvas.offsetWidth;
hudCanvas.height = hudCanvas.offsetHeight;

export const ROWS = 20;
export const COLS = 10;
export const STRING_EMPTY = '';

export const DX = canvas.width / COLS;
export const DY = canvas.height / ROWS;
export const POSITION = 4;

export const createGrid = () => Array.from({ length: ROWS }, () => Array(COLS).fill(STRING_EMPTY));
export const Randomize = (data) => data[Math.floor(Math.random() * data.length)];

