import { CellWidth, CellHeight, Min } from "./config.js";

export const iCells = [
     { pixelX: 3 * CellWidth, pixelY: -CellHeight },
     { pixelX: 4 * CellWidth, pixelY: -CellHeight },
     { pixelX: 5 * CellWidth, pixelY: -CellHeight },
     { pixelX: 6 * CellWidth, pixelY: -CellHeight },
]

export const jCells = [
     { pixelX: 4 * CellWidth, pixelY: -CellHeight },
     { pixelX: 4 * CellWidth, pixelY: Min },
     { pixelX: 5 * CellWidth, pixelY: Min },
     { pixelX: 6 * CellWidth, pixelY: Min },
]

export const lCells = [
     { pixelX: 6 * CellWidth, pixelY: -CellHeight },
     { pixelX: 4 * CellWidth, pixelY: Min },
     { pixelX: 5 * CellWidth, pixelY: Min },
     { pixelX: 6 * CellWidth, pixelY: Min },
]

export const oCells = [
     { pixelX: 4 * CellWidth, pixelY: -CellHeight },
     { pixelX: 5 * CellWidth, pixelY: -CellHeight },
     { pixelX: 4 * CellWidth, pixelY: Min },
     { pixelX: 5 * CellWidth, pixelY: Min },
]

export const sCells = [
     { pixelX: 5 * CellWidth, pixelY: -CellHeight },
     { pixelX: 6 * CellWidth, pixelY: -CellHeight },
     { pixelX: 5 * CellWidth, pixelY: Min },
     { pixelX: 4 * CellWidth, pixelY: Min },
]

export const tCells = [
     { pixelX: 5 * CellWidth, pixelY: -CellHeight },
     { pixelX: 4 * CellWidth, pixelY: Min },
     { pixelX: 5 * CellWidth, pixelY: Min },
     { pixelX: 6 * CellWidth, pixelY: Min },
]

export const zCells = [
     { pixelX: 4 * CellWidth, pixelY: -CellHeight },
     { pixelX: 5 * CellWidth, pixelY: -CellHeight },
     { pixelX: 5 * CellWidth, pixelY: Min },
     { pixelX: 6 * CellWidth, pixelY: Min },
]
