import { CellWidth, CellHeight, Min } from "./config.js";

export const iCells = [
     { x: 3 * CellWidth, y: -CellHeight },
     { x: 4 * CellWidth, y: -CellHeight },
     { x: 5 * CellWidth, y: -CellHeight },
     { x: 6 * CellWidth, y: -CellHeight },
]

export const jCells = [
     { x: 4 * CellWidth, y: -CellHeight },
     { x: 4 * CellWidth, y: Min },
     { x: 5 * CellWidth, y: Min },
     { x: 6 * CellWidth, y: Min },
]

export const lCells = [
     { x: 6 * CellWidth, y: -CellHeight },
     { x: 4 * CellWidth, y: Min },
     { x: 5 * CellWidth, y: Min },
     { x: 6 * CellWidth, y: Min },
]

export const oCells = [
     { x: 4 * CellWidth, y: -CellHeight },
     { x: 5 * CellWidth, y: -CellHeight },
     { x: 4 * CellWidth, y: Min },
     { x: 5 * CellWidth, y: Min },
]

export const sCells = [
     { x: 5 * CellWidth, y: -CellHeight },
     { x: 6 * CellWidth, y: -CellHeight },
     { x: 5 * CellWidth, y: Min },
     { x: 4 * CellWidth, y: Min },
]

export const tCells = [
     { x: 5 * CellWidth, y: -CellHeight },
     { x: 4 * CellWidth, y: Min },
     { x: 5 * CellWidth, y: Min },
     { x: 6 * CellWidth, y: Min },
]

export const zCells = [
     { x: 4 * CellWidth, y: -CellHeight },
     { x: 5 * CellWidth, y: -CellHeight },
     { x: 5 * CellWidth, y: Min },
     { x: 6 * CellWidth, y: Min },
]
