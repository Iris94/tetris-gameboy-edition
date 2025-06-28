let mainThemeAudio = null;
let sovietThemeAudio = null;
let currentTheme = null; 
export let volume = 1;
export const setVolume = (newVolume) => volume = Math.max(0, Math.min(newVolume, 1));

function stopAllThemes() {
    if (mainThemeAudio) {
        mainThemeAudio.pause();
        mainThemeAudio.currentTime = 0;
    }
    if (sovietThemeAudio) {
        sovietThemeAudio.pause();
        sovietThemeAudio.currentTime = 0;
    }
}

export function playMainTheme() {
    if (mainThemeAudio) {
        if (!mainThemeAudio.paused) {
            return;
        }
        mainThemeAudio.pause();
        mainThemeAudio.currentTime = 0;
    }
    mainThemeAudio = new Audio('sound/tetris-default.mp3');
    mainThemeAudio.loop = true;
    mainThemeAudio.volume = volume;
    mainThemeAudio.play();
    currentTheme = 'main';
}


export function playSovietTheme() {
    stopAllThemes();
    sovietThemeAudio = new Audio('sound/tetris-soviet.mp3');
    sovietThemeAudio.loop = true;
    sovietThemeAudio.volume = volume;
    sovietThemeAudio.play();
    currentTheme = 'soviet';
}

export function stopMainTheme() {
    if (mainThemeAudio) {
        mainThemeAudio.pause();
        mainThemeAudio.currentTime = 0;
    }
}

export function stopSovietTheme() {
    if (sovietThemeAudio) {
        sovietThemeAudio.pause();
        sovietThemeAudio.currentTime = 0;
    }
}

export function pauseCurrentTheme() {
    if (currentTheme === 'main' && mainThemeAudio && !mainThemeAudio.paused) {
        mainThemeAudio.pause();
    } else if (currentTheme === 'soviet' && sovietThemeAudio && !sovietThemeAudio.paused) {
        sovietThemeAudio.pause();
    }
}

export function resumeCurrentTheme() {
    if (currentTheme === 'main' && mainThemeAudio && mainThemeAudio.paused) {
        mainThemeAudio.play();
    } else if (currentTheme === 'soviet' && sovietThemeAudio && sovietThemeAudio.paused) {
        sovietThemeAudio.play();
    }
}

export function playBombTravel() {
    const audio = new Audio('sound/bomb-travel.mp3');
    audio.volume = volume;
    audio.play();
}

export function playClear() {
    const audio = new Audio('sound/tetris-clear.mp3');
    audio.volume = volume;
    audio.play();
}

export function playCollide() {
    const audio = new Audio('sound/tetris-collide.mp3');
    audio.volume = volume;
    audio.play();
}

export function playArtilleryBomb() {
    const audio = new Audio('sound/artillery-bomb.mp3');
    audio.volume = volume / 2;
    audio.play();
}

export function playArtilleryGun() {
    const audio = new Audio('sound/artillery-gun.mp3');
    audio.volume = volume;
    audio.play();
}

export function playArtilleryTarget() {
    const audio = new Audio('sound/artillery-target.mp3');
    audio.volume = volume;
    audio.play();
}

export function playArtilleryOutro() {
    const audio = new Audio('sound/artillery-outro.mp3');
    audio.volume = volume;
    audio.play();
}

export function playNinjaSlice() {
    const audio = new Audio('sound/ninja-slice.mp3');
    audio.volume = volume;
    audio.play();
}

export function playNinjaIntro() {
    const audio = new Audio('sound/ninja-intro.mp3');
    audio.volume = volume;
    audio.play();
}

export function playNinjaOutro() {
    const audio = new Audio('sound/ninja-outro.mp3');
    audio.volume = volume;
    audio.play();
}

export function playRiotsIntro() {
    const audio = new Audio('sound/riots-intro.mp3');
    audio.volume = volume;
    audio.play();
}

export function playRiotsSirens() {
    const audio = new Audio('sound/riots-sirens.mp3');
    audio.volume = volume / 2;
    audio.play();
}

export function playGameOver() {
    const audio = new Audio('sound/game-over.mp3');
    audio.volume = volume;
    audio.play();
}

export function playSpecial() {
    const audio = new Audio('sound/tetris-special.mp3');
    audio.volume = volume;
    audio.play();
}

export function playDrop() {
    const audio = new Audio('sound/drop.mp3');
    audio.volume = volume;
    audio.play();
}

export function playLevelUp() {
    const audio = new Audio('sound/level-up.mp3');
    audio.volume = volume;
    audio.play();
}