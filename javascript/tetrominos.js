canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

export const X_Point = canvas.width / 10;
export const Y_Point = canvas.height / 20;

export const iCells = [
     { x: 3 * X_Point, y: -Y_Point },
     { x: 4 * X_Point, y: -Y_Point },
     { x: 5 * X_Point, y: -Y_Point },
     { x: 6 * X_Point, y: -Y_Point },
]

export const jCells = [
     { x: 4 * X_Point, y: -Y_Point },
     { x: 4 * X_Point, y: 0 },
     { x: 5 * X_Point, y: 0 },
     { x: 6 * X_Point, y: 0 },
]

export const lCells = [
     { x: 6 * X_Point, y: -Y_Point },
     { x: 4 * X_Point, y: 0 },
     { x: 5 * X_Point, y: 0 },
     { x: 6 * X_Point, y: 0 },
]

export const oCells = [
     { x: 4 * X_Point, y: -Y_Point },
     { x: 5 * X_Point, y: -Y_Point },
     { x: 4 * X_Point, y: 0 },
     { x: 5 * X_Point, y: 0 },
]

export const sCells = [
     { x: 5 * X_Point, y: -Y_Point },
     { x: 6 * X_Point, y: -Y_Point },
     { x: 5 * X_Point, y: 0 },
     { x: 4 * X_Point, y: 0 },
]

export const tCells = [
     { x: 5 * X_Point, y: -Y_Point },
     { x: 4 * X_Point, y: 0 },
     { x: 5 * X_Point, y: 0 },
     { x: 6 * X_Point, y: 0 },
]

export const zCells = [
     { x: 4 * X_Point, y: -Y_Point },
     { x: 5 * X_Point, y: -Y_Point },
     { x: 5 * X_Point, y: 0 },
     { x: 6 * X_Point, y: 0 },
]
