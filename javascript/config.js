canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

export const Rows = 20;
export const Cols = 10;
export const CellWidth = canvas.width / Cols;
export const CellHeight = canvas.height / Rows;
export const Min = 0;

export let collisionDetected;
export let leftWallDetected;
export let rightWallDetected;

export function setCollisionDetected(value) {
     collisionDetected = value;
 }

 export function setLeftWallDetected(value) {
     leftWallDetected = value;
 }

 export function setRightWallDetected(value) {
     rightWallDetected = value;
 }