import { occtx, ocontent, octx, overlay, Randomize } from "../config.js";
import { playSpecial } from "../sound.js";

export async function specialsIntro(data) {
    return new Promise(resolve => {
        const image = getOverlayImage(data);
        const text = getOverlayText(data);
        let overlayColor = 'rgba(0, 0, 0, 0.75)';

        image.onload = () => {
            playSpecial();
            octx.clearRect(0, 0, overlay.width, overlay.height);

            const startPositionMap = {
                ninja: overlay.width * 4,
                artillery: overlay.height * 2,
                riot: overlay.height * 2,
                invasion: overlay.height
            };

            let startPosition = startPositionMap[data];

            const drawParams = {
                ninja: () => [image, 50, 50, special.width * 2 , special.height],
                artillery: () => [image, 75, 75, special.width * 2 , special.height],
                riot: () => [image, 0, 25, special.width * 2 , special.height],
                invasion: () => [image, 0, startPosition, special.width + (special.width * 0.75), special.height / 1.1]
            };

            function screenOverlay() {
                octx.fillStyle = overlayColor;
                octx.fillRect(0, 0, overlay.width, overlay.height);
            }

            function animateImage() {
                if (startPosition > ocontent.width * 0.25) {
                    startPosition -= 30;
                    occtx.clearRect(0, 0, ocontent.width, ocontent.height);
                    occtx.drawImage(...drawParams[data]());
                    requestAnimationFrame(animateImage);
                } else {
                    showText();
                }
            }

            function showText() {
                screenOverlay();
                occtx.font = '1rem Gill Sans';
                occtx.fillStyle = 'whitesmoke';
                occtx.fillText(text, 15, ocontent.height / 10, ocontent.width);

                setTimeout(() => {
                    removeTextAndMoveImage();
                }, 2000);
            }

            function removeTextAndMoveImage() {
                function animateOut() {
                    startPosition += 30;

                    if (startPosition > special.width + 200) {
                        octx.clearRect(0, 0, overlay.width, overlay.height);
                        occtx.clearRect(0, 0, ocontent.width, ocontent.height);
                        resolve();
                    } else {
                        occtx.clearRect(0, 0, ocontent.width, ocontent.height);
                        occtx.drawImage(...drawParams[data]());
                        requestAnimationFrame(animateOut);
                    }
                }
                animateOut();
            }

            animateImage();
        };
    });
}


function getOverlayText(data) {
    let returnText;

    const phrases = {
        ninja: [
            "We are here to serve",
            "The shadows are your ally.",
            "Silence is your weapon.",
            "Strike swift, vanish quicker.",
            "Death comes without a sound."
        ],
        artillery: [
            "The cavalry is here!",
            "Artillery strike inbound!",
            "Target acquired, engaging now.",
            "Precision strike initiated.",
            "Mission objective in progress."
        ],
        invasion: [
            "The Motherland advances!",
            "Victory is inevitable, comrade.",
            "Steel walls, unstoppable force.",
            "The red tide rises.",
            "Unity through power and strength."
        ],
        riot: [
            "The riot never sleeps",
            "SHIELDS UP!",
            "Force meets resistance",
            "Order through chaos",
            "I...said...MOVE!!!"
        ]
    };

    return returnText = Randomize(phrases[data])
}

function getOverlayImage(data) {
    const img = new Image();
    img.src = `./assets/${data}.png`;
    return img;
}