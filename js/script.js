document.addEventListener('DOMContentLoaded', () => {
    // Task 3: open and close the subscription popup.
    const modal = document.getElementById('popup-modal');
    const openButton = document.getElementById('open-popup-btn');
    const closeButton = document.getElementById('close-popup-btn');
    const emailInput = document.getElementById('popup-email');
    function closePopup() {
        modal.hidden = true;
        document.body.style.overflow = '';
        openButton.focus();
    }
    if (modal && openButton && closeButton) {
        openButton.addEventListener('click', () => {
            modal.hidden = false;
            document.body.style.overflow = 'hidden';
            emailInput.focus();
        });
        closeButton.addEventListener('click', closePopup);
        modal.addEventListener('click', (event) => {
            if (event.target === modal) closePopup();
        });
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && !modal.hidden) closePopup();
        });
    }

    // Validate the popup email. Full Task 1 validation is in booking.js.
    const subscribeForm = document.getElementById('subscribe-form');
    if (subscribeForm) {
        const error = document.getElementById('email-error');
        const status = document.getElementById('subscribe-status');
        subscribeForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const email = emailInput.value.trim();
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            let message = '';
            if (email === '') message = 'Email is required.';
            else if (!emailPattern.test(email)) message = 'Please enter a valid email address.';
            error.textContent = message;
            error.hidden = message === '';
            emailInput.setAttribute('aria-invalid', String(message !== ''));
            status.textContent = '';
            if (message) emailInput.focus();
            else {
                status.textContent = 'Thank you! The demo subscription was validated. No email was sent.';
                subscribeForm.reset();
            }
        });
    }

    // Task 2: clicking a question toggles its answer.
    const headers = document.querySelectorAll('.accordion-header');
    headers.forEach((header, index) => {
        const content = header.nextElementSibling;
        content.id = 'faq-answer-' + index;
        header.setAttribute('aria-controls', content.id);
        header.addEventListener('click', () => {
            const isOpen = header.getAttribute('aria-expanded') === 'true';
            header.setAttribute('aria-expanded', String(!isOpen));
            content.setAttribute('aria-hidden', String(isOpen));
            content.style.maxHeight = isOpen ? '0px' : content.scrollHeight + 'px';
        });
    });
    window.addEventListener('resize', () => {
        headers.forEach(header => {
            if (header.getAttribute('aria-expanded') === 'true') {
                const content = header.nextElementSibling;
                content.style.maxHeight = content.scrollHeight + 'px';
            }
        });
    });

    // Task 4: cycle through five background colors.
    const themeButton = document.getElementById('change-bg-btn');
    if (themeButton) {
        const colors = ['#f4f6f8', '#e2e8f0', '#fef3c7', '#e0f2fe', '#f3e8ff'];
        let colorIndex = 0;
        themeButton.addEventListener('click', () => {
            colorIndex = (colorIndex + 1) % colors.length;
            document.body.style.backgroundColor = colors[colorIndex];
        });
    }

    // Task 5: show the visitor's local date and time every second.
    const dateTime = document.getElementById('current-date-time');
    if (dateTime) {
        function updateDateTime() {
            dateTime.textContent = new Date().toLocaleString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit', second: '2-digit'
            });
        }
        updateDateTime();
        setInterval(updateDateTime, 1000);
    }
});
