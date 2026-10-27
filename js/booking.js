// Assignment 5: a multi-step form with callbacks and preserved input values.
const bookingForm = document.getElementById('booking-form');

if (bookingForm) {
    const steps = bookingForm.querySelectorAll('.booking-step');
    const progressItems = document.querySelectorAll('.booking-progress li');
    const backButton = document.getElementById('booking-back');
    const nextButton = document.getElementById('booking-next');
    const confirmButton = document.getElementById('booking-confirm');
    const statusMessage = document.getElementById('booking-status');
    let currentStep = 0;
    let isConfirmed = false;

    const hotelId = new URLSearchParams(window.location.search).get('hotel');
    const selectedHotel = typeof hotelsDatabase !== 'undefined'
        ? hotelsDatabase.find(hotel => hotel.id === hotelId) || hotelsDatabase[0]
        : { name: 'Grand Palace Hotel', price: 120 };
    document.getElementById('booking-hotel-name').textContent = selectedHotel.name;

    function showError(id, message) {
        document.getElementById(id + '-error').textContent = message;
        document.getElementById(id).setAttribute('aria-invalid', 'true');
    }

    function clearErrors() {
        bookingForm.querySelectorAll('.field-error').forEach(error => {
            error.textContent = '';
        });
        bookingForm.querySelectorAll('[aria-invalid]').forEach(field => {
            field.removeAttribute('aria-invalid');
        });
        statusMessage.textContent = '';
        statusMessage.className = 'form-status mb-0';
    }

    function validateStep(stepIndex) {
        clearErrors();
        const step = steps[stepIndex];
        step.querySelectorAll('[required]').forEach(field => {
            if (field.type !== 'radio' && field.type !== 'checkbox' && !field.value.trim()) {
                showError(field.id, 'This field is required.');
            }
        });

        if (stepIndex === 0) {
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const confirmation = document.getElementById('confirm-password').value;
            if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                showError('email', 'Enter a valid email, for example name@example.com.');
            }
            if (password.trim() && password.length < 8) {
                showError('password', 'Password must contain at least 8 characters.');
            }
            if (confirmation.trim() && password !== confirmation) {
                showError('confirm-password', 'Passwords do not match.');
            }
        }

        if (stepIndex === 1) {
            const checkin = document.getElementById('checkin').value;
            const checkout = document.getElementById('checkout').value;
            const phone = document.getElementById('phone').value.trim();
            // Date inputs use YYYY-MM-DD, so strings can be compared directly.
            if (checkin && checkout && checkout <= checkin) {
                showError('checkout', 'Check-out must be after the check-in date.');
            }
            if (!bookingForm.querySelector('input[name="room"]:checked')) {
                showError('standard', 'Choose a room type.');
            }
            if (phone && (!/^[0-9()\s-]+$/.test(phone) || phone.replace(/\D/g, '').length !== 10)) {
                showError('phone', 'Enter 10 digits after +7.');
            }
        }

        if (stepIndex === 2 && !document.getElementById('terms').checked) {
            showError('terms', 'Please agree to the booking terms.');
        }

        const firstInvalid = step.querySelector('[aria-invalid="true"]');
        if (firstInvalid) {
            changeStep(stepIndex, showStep);
            statusMessage.textContent = 'Please correct the highlighted fields.';
            statusMessage.classList.add('error');
            firstInvalid.focus();
            return false;
        }
        return true;
    }

    // A callback receives the new step. Hiding sections keeps all input values.
    function changeStep(nextStep, onStepChanged) {
        currentStep = nextStep;
        onStepChanged(currentStep);
    }

    function showStep(stepIndex) {
        steps.forEach((step, index) => {
            step.hidden = index !== stepIndex;
        });
        progressItems.forEach((item, index) => {
            if (index === stepIndex) item.setAttribute('aria-current', 'step');
            else item.removeAttribute('aria-current');
        });
        backButton.hidden = stepIndex === 0;
        nextButton.hidden = stepIndex === steps.length - 1;
        confirmButton.hidden = stepIndex !== steps.length - 1;
        if (stepIndex === 2) updateSummary();
        steps[stepIndex].querySelector('h2').focus();
    }

    // Object methods calculate nights and a simple estimated room price.
    const booking = {
        getNights() {
            const checkin = new Date(document.getElementById('checkin').value);
            const checkout = new Date(document.getElementById('checkout').value);
            return Math.round((checkout - checkin) / 86400000);
        },
        getNightlyPrice() {
            const room = bookingForm.querySelector('input[name="room"]:checked').value;
            const extra = { standard: 0, deluxe: 40, suite: 80 };
            return selectedHotel.price + extra[room];
        },
        getTotal() {
            return this.getNights() * this.getNightlyPrice();
        }
    };

    function updateSummary() {
        const summary = document.getElementById('booking-summary');
        const room = bookingForm.querySelector('input[name="room"]:checked');
        const rows = [
            ['Hotel', selectedHotel.name],
            ['Guest', document.getElementById('fullname').value.trim()],
            ['Email', document.getElementById('email').value.trim()],
            ['Dates', document.getElementById('checkin').value + ' to ' + document.getElementById('checkout').value],
            ['Room', room.value + ' ($' + booking.getNightlyPrice() + ' / night)'],
            ['Guests', document.getElementById('guests').value],
            ['Phone', '+7 ' + document.getElementById('phone').value.trim()],
            ['Special requests', document.getElementById('notes').value.trim() || 'None'],
            ['Estimated total', '$' + booking.getTotal() + ' for ' + booking.getNights() + ' night(s)']
        ];
        summary.textContent = '';
        rows.forEach(([label, value]) => {
            const term = document.createElement('dt');
            const description = document.createElement('dd');
            term.textContent = label;
            description.textContent = value;
            summary.append(term, description);
        });
    }

    bookingForm.addEventListener('submit', event => {
        event.preventDefault();
        if (isConfirmed) return;
        if (currentStep < 2) {
            if (validateStep(currentStep)) changeStep(currentStep + 1, showStep);
            return;
        }
        // Recheck earlier steps before confirming, including after using Back.
        for (let index = 0; index < steps.length; index++) {
            if (!validateStep(index)) return;
        }
        statusMessage.textContent = 'Validation passed! This is a demo: no account or booking was created.';
        statusMessage.classList.add('success');
        document.getElementById('password').value = '';
        document.getElementById('confirm-password').value = '';
        confirmButton.disabled = true;
        isConfirmed = true;
        backButton.hidden = true;
        statusMessage.focus();
    });

    backButton.addEventListener('click', () => {
        clearErrors();
        changeStep(currentStep - 1, showStep);
    });

    bookingForm.addEventListener('reset', () => {
        clearErrors();
        confirmButton.disabled = false;
        isConfirmed = false;
        document.getElementById('booking-summary').textContent = '';
        changeStep(0, showStep);
    });
}
