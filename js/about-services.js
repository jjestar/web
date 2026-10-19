// Show the visitor's local date and time on About and Services.
const clock = document.getElementById('current-date-time');

function updateDateTime() {
    const now = new Date();
    clock.textContent = now.toLocaleString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });
    clock.dateTime = now.toISOString();
}

if (clock) {
    updateDateTime();
    setInterval(updateDateTime, 1000);
}

// Each FAQ button opens or closes its own answer.
const faqButtons = document.querySelectorAll('.service-faq-question');

faqButtons.forEach(function (button) {
    button.addEventListener('click', function () {
        const answer = document.getElementById(button.getAttribute('aria-controls'));
        const isOpen = button.getAttribute('aria-expanded') === 'true';

        button.setAttribute('aria-expanded', String(!isOpen));
        answer.setAttribute('aria-hidden', String(isOpen));
        answer.style.maxHeight = isOpen ? '0px' : answer.scrollHeight + 'px';
        button.querySelector('.faq-symbol').textContent = isOpen ? '+' : '\u2212';
    });
});

// Keep expanded answers visible when the browser width changes.
window.addEventListener('resize', function () {
    faqButtons.forEach(function (button) {
        if (button.getAttribute('aria-expanded') === 'true') {
            const answer = document.getElementById(button.getAttribute('aria-controls'));
            answer.style.maxHeight = answer.scrollHeight + 'px';
        }
    });
});
