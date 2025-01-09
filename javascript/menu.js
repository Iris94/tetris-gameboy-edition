import { volume, setVolume } from "./sound.js";

export const volumeMenuButton = document.getElementById('volume');
export const increaseVolButton = document.getElementById('volumeUp');
export const decreaseVolButton = document.getElementById('volumeDown');
export const backButton = document.querySelector('.back');

export const mainMenu = document.getElementById('mainMenu');
export const mainNavigation = document.getElementById('mainNavigation');
export const volumeNavigation = document.getElementById('volumeNavigation');

volumeMenuButton.onclick = function () {
    mainNavigation.classList.contains('show')
        ? (
            mainNavigation.classList.remove('show'),
            mainNavigation.classList.add('hide'),
            volumeNavigation.classList.remove('hide'),
            volumeNavigation.classList.add('show'))
        : null;
    showCurrentVolume();
};

decreaseVolButton.onclick = () => {
    setVolume(volume - 0.1);
    showCurrentVolume();
}

increaseVolButton.onclick = () => {
    setVolume(volume + 0.1);
    showCurrentVolume();
}

backButton.onclick = () => {
    console.log(volume.toString());
};

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
        volumeControlWrap.appendChild(volumeBar)
    }
}