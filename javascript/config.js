export const CANVAS = document.querySelector('#canvas');
export const CTX = canvas.getContext("2d", { willReadFrequently: true });

canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

export const ROWS = 20;
export const COLS = 10;

export const DX = canvas.width / COLS;
export const DY = canvas.height / ROWS;
