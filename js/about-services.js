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

// Keep the contact demo on this page; no request or email is sent.
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    const contactStatus = document.getElementById('contact-status');
    const contactFields = contactForm.querySelectorAll('[required]');
    contactForm.addEventListener('submit', function (event) {
        event.preventDefault();
        let firstInvalid = null;
        contactFields.forEach(function (field) {
            field.setCustomValidity('');
            if (!field.value.trim()) {
                field.setCustomValidity('Please complete this field.');
            } else if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim())) {
                field.setCustomValidity('Please enter a valid email address.');
            }
            const isValid = field.checkValidity();
            field.setAttribute('aria-invalid', String(!isValid));
            if (!isValid && !firstInvalid) firstInvalid = field;
        });
        if (firstInvalid) {
            contactStatus.className = 'small mt-3 mb-0 text-danger';
            contactStatus.textContent = 'Please enter your name, a valid email address, and a message.';
            firstInvalid.focus();
            firstInvalid.reportValidity();
            return;
        }
        contactStatus.className = 'small mt-3 mb-0 text-success';
        contactStatus.textContent = 'Your demo message was validated. No email was sent.';
        contactStatus.focus();
    });
    contactFields.forEach(function (field) {
        field.addEventListener('input', function () {
            field.setCustomValidity('');
            field.removeAttribute('aria-invalid');
            contactStatus.textContent = '';
        });
    });
}
