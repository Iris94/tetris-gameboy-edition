import { drawMainBoard, drawTetromino, redrawTetrominos, drawHud, drawNextTetromino, drawMana } from "./draws.js";
import { clearMainBoard, clearHud, clearFilteredRows, filterRows, copyImageData, pasteImageData, updateGrid, shiftFilteredCols, initiateId, initiateTetrominoInfo, shiftFilteredRows, checkForClears, clearSpecial, reconstructGrid, prepareDropCells, collectBlocks, clearShadows, clearMana } from "./updates.js";
import { tetrominoShapes } from "./tetrominos.js";
import { Cols, createGrid, Randomize, Position, tetrominoObjectPool, activeTetrominoPool, particlesObjectPool, playGameButton, startBtn, restartBtn, resumeBtn, descriptionTxt, gameoverTxt, End, scoreScreen, levelScreen } from "./config.js";
import { rotation, shadowRotation } from "./rotation.js";
import { artilleryBonus, calculateClearingScore, calculateCollisionScore, calculateLevel, invasionBonus, ninjaBonus, randomTetromino, riotBonus, updateLevel, updateScore } from "./metrics.js";
import { ninjaStrike } from "./animations/ninjaStrike.js";
import { drops } from "./animations/drops.js";
import { animateClears } from "./animations/clears.js";
import { artilleryStrike } from "./animations/artilleryStrike.js";
import { invasionStrike } from "./animations/invasionStrike.js";
import { pauseCurrentTheme, playClear, playCollide, playGameOver, playLevelUp, playMainTheme, resumeCurrentTheme, stopMainTheme, stopSovietTheme } from './sound.js';
import { riotStrike } from "./animations/riotStrike.js";
import { shadowPush } from "./animations/shadowPush.js";

export let grid = [];
export let tetrominoObjects = [];
export let objectPoolArray;
export let particlesPool;
export let reuseObjectIdArray = [];
export let tetrominoId = 0;
export let mainBoardData;
export let emptyBoardData;
export let clearBoardData;
export let shadowFlag = false;
export let tetrominosArray = [];
export let filterRowsData = [];
export let dropCellsData = [];
export let isCollision = false;
export let targetRow = 0;
export let clearRowsMultiplier = 1;
export let clearMultiplier = 10;
export let bonusScore = null;
export let variableGoalSystem = 0;
export let tetromino;
export let nextTetromino;
export let score = 0
export let level = 1;
export let manaLevel = 94;
export let holdManaPoints = 0;
export let pause = true;
export let previousMouseX = 0;
export let isDragging = false;
export let gameplayStatus;
export let gameplayAcceleration = 1000;
export let menuOpened = true;
export let gameStarted = false;

export class Tetromino {
    constructor(name, color, ghostColor, cells) {
        this.name = name;
        this.color = color;
        this.ghostColor = ghostColor;
        this.cells = cells;
        this.shadowSwitch = false;
        this.positionZero = structuredClone(cells);
        this.shadow = { cells: structuredClone(cells), color: ghostColor, name };
    }

    async shadowMove() {
        pauseGame();
        shadowFlag = await shadowPush();
        isCollision = true;
        resumeGame();
    }

    calculateRotation() {
        this.shadowSwitch = false;
        rotation();
        tetromino.calculateShadow();
    }

    calculateShadow() {
        this.shadow.cells = structuredClone(this.cells);
        shadowRotation(this.shadow);
    }

    moveDown() {
        const initializeMovement = !this.cells.some(cell => cell.y === End || grid[cell.y + 1][cell.x] !== 0);
        initializeMovement
            ? this.cells.forEach(cell => cell.y += 1)
            : isCollision = true;
    }

    moveLeft() {
        const initializeMovement = this.cells.some(cell => cell.x === 0 || grid[cell.y][cell.x - 1] !== 0);
        if (initializeMovement) return;

        this.cells.forEach(cell => cell.x -= 1);
        this.shadowSwitch = true;
        tetromino.calculateShadow();
    }

    moveRight() {
        const initializeMovement = this.cells.some(cell => cell.x === Cols - 1 || grid[cell.y][cell.x + 1] !== 0);
        if (initializeMovement) return;

        this.cells.forEach(cell => cell.x += 1);
        this.shadowSwitch = true;
        tetromino.calculateShadow();
    }

    defaultCoordinates() {
        this.cells = structuredClone(this.positionZero);
    }
}

initializeGame();
drawNextTetromino();

function assembleTetrominos() {
    tetrominoShapes.forEach(shape => {
        shape.cells.forEach(cell => cell.x += Position);
        tetrominosArray.push(new Tetromino(
            shape.name, shape.color, shape.ghostColor, shape.cells
        ));
    });
}

export function resetGameplayInterval() {
    gameplayStatus && clearInterval(gameplayStatus);
    startGame();
}

function incrementAcceleration() {
    if (gameplayAcceleration <= 30) return;
    gameplayAcceleration /= 1.14;
}

function initializeGame() {
    objectPoolArray = tetrominoObjectPool();
    tetrominoObjects = activeTetrominoPool();
    particlesPool = particlesObjectPool();
    drawMainBoard();
    drawHud();
    drawMana();
    updateScore();
    updateLevel();
    mainBoardData = copyImageData();
    assembleTetrominos();
    grid = createGrid();
    nextTetromino = Randomize(tetrominosArray);
    tetromino = Randomize(tetrominosArray);
    drawTetromino();
    tetromino.calculateShadow();
}

export async function gameEngine() {
    if (menuOpened) return;
    if (!isCollision) return movePhase();
    tetromino.calculateShadow();

    tetrominoId = initiateId();
    updateGrid() && gameOver();
    initiateTetrominoInfo();
    shadowFlag && redrawTetrominos();

    clearShadows();
    pauseGame();
    clearHud();
    filterRowsData = filterRows();
    tetromino.defaultCoordinates();
    tetromino = nextTetromino;
    tetromino.calculateShadow();
    nextTetromino = randomTetromino();
    drawHud();
    drawNextTetromino();

    !filterRowsData ? collisionPhase() : await clearPhase();

    while (holdManaPoints > 0) {
        manaLevel++;
        holdManaPoints--;
        await specialsPhase();
        drawMana(manaLevel);
    }

    if (variableGoalSystem > (level * 5)) {
        playLevelUp();
        level++;
        updateLevel();
        incrementAcceleration();
    }

    manaLevel >= 100 && (manaLevel = 0);
    drawMana(manaLevel);
    clearRowsMultiplier = 1;
    holdManaPoints = 0;
    isCollision = false;
    shadowFlag = false;
    bonusScore = null;
    mainBoardData = copyImageData();
    drawTetromino();
    resumeGame();
}

export async function clearPhase() {
    playClear();
    clearRowsMultiplier = filterRowsData.length;
    variableGoalSystem += calculateLevel(clearRowsMultiplier);
    holdManaPoints += clearRowsMultiplier;

    while (filterRowsData.length > 0) {
        const copyTetrominoObjects = structuredClone(tetrominoObjects);
        const collectId = filterRowsData[0] - 1;

        animateClears(filterRowsData, 'default');

        clearFilteredRows(filterRowsData);
        const collectBlocksData = collectBlocks(collectId);
        shiftFilteredRows(filterRowsData[0]);
        shiftFilteredCols(collectBlocksData);

        const dropCellsData = prepareDropCells(copyTetrominoObjects, collectBlocksData)
        let copyGrid = structuredClone(grid);
        reconstructGrid(copyGrid, dropCellsData);
        redrawTetrominos(copyGrid);

        await drops(dropCellsData);

        clearMultiplier++;
        score += calculateClearingScore(filterRowsData.length);
        updateScore();
        holdManaPoints += filterRowsData.length;
        filterRowsData = checkForClears();
    }
}

export function collisionPhase() {
    playCollide();
    score += calculateCollisionScore();
    updateScore();
    holdManaPoints++;
    clearMultiplier = 10;
}

export function movePhase() {
    clearMainBoard();
    clearShadows();
    pasteImageData(mainBoardData);
    drawTetromino();
}

export const getSpecialsScore = (data) => bonusScore = data;

async function specialsPhase() {
    const startNinja = async () => await ninjaStrike();
    const startInvasion = async () => await invasionStrike();
    const startArtillery = async () => await artilleryStrike();
    const startRiots = async () => await riotStrike();

    const allSpecials = [startInvasion, startRiots, startArtillery, startNinja];
    let specialTriggered = false;

    switch (manaLevel) {
        case 25:
        case 75:
            if (Math.random() < 0.25) {
                Math.random() < 0.50 ? await startRiots() : await startNinja();
                specialTriggered = true;
            }
            break;
        case 50:
            if (Math.random() < 0.5) {
                await startArtillery();
                specialTriggered = true;
            }
            break;
        default:
            if (manaLevel >= 100) {
                await startNinja();
                //Randomize(allSpecials)();
                specialTriggered = true;
            }
            break;
    }

    if (specialTriggered) {
        score += bonusScore.value * bonusScore.cells;
        filterRowsData = filterRows();
        if (filterRowsData.length > 0) await clearPhase();
        tetromino.calculateShadow();
    }
}

playGameButton.onclick = () => {
    menuOpened = false;
    gameStarted = true;
    pause = false;
    playMainTheme();
    mainMenu.style.display = 'none';
    scoreScreen.classList.replace('hide', 'show');
    levelScreen.classList.replace('hide', 'show');
    startGame();
}

resumeBtn.onclick = () => {
    menuOpened = false;
    mainMenu.style.display = 'none'
    resumeGame();
    resumeCurrentTheme();
}

restartBtn.onclick = () => {
    pause = false;
    menuOpened = false;
    mainMenu.style.display = 'none'
    descriptionTxt.classList.replace('hide', 'show');
    gameoverTxt.classList.replace('show', 'hide');
    homeAndRestart();
    playMainTheme();
    startGame();
}

export function startGame() {
    if (pause) return;

    clearInterval(gameplayStatus);

    gameplayStatus = setInterval(() => {
        tetromino.moveDown();
        gameEngine();
    }, gameplayAcceleration);
}

export function pauseGame() {
    pause = true;
    clearInterval(gameplayStatus)
}

export function resumeGame() {
    pause = false;
    startGame();
}

export function pauseEntireGame() {
    if (gameStarted && !menuOpened) {
        pauseCurrentTheme();
        pauseGame();
        menuOpened = true;
        mainMenu.style.display = 'flex'
        resumeBtn.classList.replace('hide', 'show');
        restartBtn.classList.replace('hide', 'show');
        startBtn.classList.replace('show', 'hide');
    }
}

export function gameOver() {
    stopMainTheme();
    stopSovietTheme();
    playGameOver();
    pauseGame();
    pauseCurrentTheme();
    menuOpened = true;
    mainMenu.style.display = 'flex'
    resumeBtn.classList.replace('show', 'hide');
    restartBtn.classList.replace('hide', 'show');
    startBtn.classList.replace('show', 'hide');
    descriptionTxt.classList.replace('show', 'hide');
    gameoverTxt.classList.replace('hide', 'show');
}

export function homeAndRestart() {
    clearMainBoard();
    clearHud();
    clearSpecial();
    clearMana();
    mainBoardData = copyImageData();
    grid = createGrid();
    drawHud();
    score 
    drawMana();
    tetromino.defaultCoordinates();
    tetromino = nextTetromino;
    nextTetromino = randomTetromino();
    drawNextTetromino();
    objectPoolArray = tetrominoObjectPool();
    tetrominoObjects = activeTetrominoPool();
    particlesPool = particlesObjectPool();
    tetrominoId = 0;
    isCollision = false;
    targetRow = 0;
    clearRowsMultiplier = 1;
    clearMultiplier = 10;
    variableGoalSystem = 0;
    score = 0;
    level = 1;
    updateScore();
    updateLevel();
    manaLevel = 0;
    gameplayAcceleration = 1000;
    stopMainTheme();
    stopSovietTheme();
}