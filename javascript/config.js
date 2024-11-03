export const CANVAS = document.querySelector('#canvas');
export const CTX = canvas.getContext("2d", { willReadFrequently: true });

export const SCORE_CANVAS = document.querySelector('#scoreCanvas');
export const SCORE_CTX = SCORE_CANVAS.getContext('2d', { willReadFrequently: true });

canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

scoreCanvas.width = scoreCanvas.offsetWidth;
scoreCanvas.height = scoreCanvas.offsetHeight;

export const ROWS = 20;
export const COLS = 10;
export const STRING_EMPTY = '';

export const DX = canvas.width / COLS;
export const DY = canvas.height / ROWS;
