// Assignment 5: keyboard navigation on every page.
const menuLinks = Array.from(document.querySelectorAll('#mainNav .nav-link'));
menuLinks.forEach(function (link, index) {
    link.addEventListener('keydown', function (event) {
        let nextIndex = index;
        switch (event.key) {
            case 'ArrowRight':
            case 'ArrowDown':
                nextIndex = (index + 1) % menuLinks.length;
                break;
            case 'ArrowLeft':
            case 'ArrowUp':
                nextIndex = (index - 1 + menuLinks.length) % menuLinks.length;
                break;
            case 'Home': nextIndex = 0; break;
            case 'End': nextIndex = menuLinks.length - 1; break;
            default: return;
        }
        event.preventDefault();
        menuLinks[nextIndex].focus();
    });
});

// One Audio object is reused, so repeated clicks restart the same sound.
const clickSound = new Audio('image/click.mp3');
clickSound.volume = 0.45;
const soundButton = document.getElementById('sound-toggle');
const soundStatus = document.getElementById('sound-status');
let soundEnabled = true;

function playClickSound() {
    if (!soundEnabled) return;
    clickSound.pause();
    clickSound.currentTime = 0;
    clickSound.play().then(function () {
        if (soundStatus) soundStatus.textContent = 'Click sound played.';
    }).catch(function () {
        if (soundStatus) soundStatus.textContent = 'Sound is unavailable in this browser.';
    });
}

if (soundButton) {
    soundButton.addEventListener('click', function () {
        soundEnabled = !soundEnabled;
        soundButton.textContent = soundEnabled ? 'Sound: On' : 'Sound: Off';
        soundButton.setAttribute('aria-pressed', String(soundEnabled));
        if (!soundEnabled) clickSound.pause();
        if (soundStatus) soundStatus.textContent = soundEnabled ? 'Sound enabled.' : 'Sound muted.';
    });
}

// Event delegation also works for dynamically created controls.
document.addEventListener('click', function (event) {
    const button = event.target.closest('button');
    if (!button || button === soundButton) return;
    playClickSound();
    // Restart a short CSS animation after each click.
    button.classList.remove('button-pop');
    void button.offsetWidth;
    button.classList.add('button-pop');
});
