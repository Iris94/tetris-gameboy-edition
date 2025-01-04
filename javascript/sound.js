export function playMainTheme () {
    const audio = new Audio('sound/tetris-default.mp3');
    audio.loop = true;
    audio.play();
}

export function playClear () {
    const audio = new Audio('sound/tetris-clear.mp3');
    audio.play();
}

export function playCollide () {
    const audio = new Audio('sound/tetris-collide.mp3');
    audio.play();
}