import { volume, setVolume } from "./sound.js";

export const volumeMenuButton = document.getElementById('volume');
export const increaseVolButton = document.getElementById('volumeUp');
export const decreaseVolButton = document.getElementById('volumeDown');
export const backButton = document.querySelector('.back');
export const mainMenu = document.getElementById('mainMenu');
export const mainNavigation = document.getElementById('mainNavigation');
export const volumeNavigation = document.getElementById('volumeNavigation');

export const scoreMenuButton = document.getElementById('score');
export const scoreNavigation = document.getElementById('scoreNavigation');
export const enterScoreButton = document.getElementById('enterScore');
export const scoreBackButton = document.getElementById('scoreBack');

export const resumeBtn = document.getElementById('resume');
export const restartBtn = document.getElementById('restart');
export const homeBtn = document.getElementById('home');
export const startBtn = document.getElementById('start');
export const scoreBtn = document.getElementById('score');

volumeMenuButton.onclick = function () {
    toggleNavigation(mainNavigation, volumeNavigation);
    showCurrentVolume();
};

scoreMenuButton.onclick = function () {
    toggleNavigation(mainNavigation, scoreNavigation);
};

decreaseVolButton.onclick = () => {
    setVolume(volume - 0.1);
    showCurrentVolume();
};

increaseVolButton.onclick = () => {
    setVolume(volume + 0.1);
    showCurrentVolume();
};

backButton.onclick = () => {
    toggleNavigation(volumeNavigation, mainNavigation);
};

scoreBackButton.onclick = () => {
    toggleNavigation(scoreNavigation, mainNavigation);
};

enterScoreButton.onclick = () => {
    const playerName = document.getElementById('playerName').value.trim();
    if (playerName) {
        storeHighScore(playerName, getCurrentScore());
    }
};

function toggleNavigation(hideElement, showElement) {
    hideElement.classList.remove('show');
    hideElement.classList.add('hide');
    showElement.classList.remove('hide');
    showElement.classList.add('show');
}

function showCurrentVolume() {
    const volumeControlWrap = document.querySelector('.volume-control-wrap');
    let currentVolume = Math.round(volume * 10);
    volumeControlWrap.innerHTML = '';

    for (let i = 1; i <= currentVolume; i++) {
        const volumeBar = document.createElement('div');
        volumeBar.style.height = `${i + (9 * i)}%`;
        volumeBar.style.width = '0.4rem';
        volumeBar.style.margin = '0.3rem';
        volumeBar.style.backgroundColor = '#036969';
        volumeControlWrap.appendChild(volumeBar);
    }
}

function storeHighScore(playerName, score) {
    let highScores = JSON.parse(localStorage.getItem('highScores')) || [];
    highScores.push({ name: playerName, score: score });
    highScores.sort((a, b) => b.score - a.score);  
    highScores = highScores.slice(0, 3); 
    localStorage.setItem('highScores', JSON.stringify(highScores));
}

function getCurrentScore() {
    return Math.floor(Math.random() * 100);  
}
