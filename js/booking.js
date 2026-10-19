// Task 1: validate the booking form before showing a demo confirmation.
const bookingForm = document.getElementById('booking-form');

// The same file is linked on the hotel page, which has no booking form.
if (bookingForm) {
    const statusMessage = document.getElementById('booking-status');

    function showError(id, message) {
        document.getElementById(id + '-error').textContent = message;
        document.getElementById(id).setAttribute('aria-invalid', 'true');
    }

    function clearErrors() {
        bookingForm.querySelectorAll('.field-error').forEach(function (error) {
            error.textContent = '';
        });
        bookingForm.querySelectorAll('[aria-invalid]').forEach(function (field) {
            field.removeAttribute('aria-invalid');
        });
        statusMessage.textContent = '';
        statusMessage.className = 'form-status mb-0';
    }

    bookingForm.addEventListener('submit', function (event) {
        // This assignment demo does not send data to a server.
        event.preventDefault();
        clearErrors();

        const requiredFields = {
            'fullname': 'Enter your full name.',
            'email': 'Enter your email address.',
            'password': 'Enter a password.',
            'confirm-password': 'Confirm your password.',
            'checkin': 'Choose a check-in date.',
            'checkout': 'Choose a check-out date.',
            'guests': 'Choose the number of guests.',
            'phone': 'Enter your phone number.'
        };

        Object.keys(requiredFields).forEach(function (id) {
            if (document.getElementById(id).value.trim() === '') {
                showError(id, requiredFields[id]);
            }
        });

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmation = document.getElementById('confirm-password').value;
        const checkin = document.getElementById('checkin').value;
        const checkout = document.getElementById('checkout').value;
        const phone = document.getElementById('phone').value.trim();

        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showError('email', 'Enter a valid email, for example name@example.com.');
        }
        if (password.trim() && password.length < 8) {
            showError('password', 'Password must contain at least 8 characters.');
        }
        if (confirmation.trim() && password !== confirmation) {
            showError('confirm-password', 'Passwords do not match.');
        }
        // Date inputs use YYYY-MM-DD, so these values can be compared directly.
        if (checkin && checkout && checkout <= checkin) {
            showError('checkout', 'Check-out must be after the check-in date.');
        }
        if (!bookingForm.querySelector('input[name="room"]:checked')) {
            showError('standard', 'Choose a room type.');
        }
        if (phone && (!/^[0-9()\s-]+$/.test(phone) || phone.replace(/\D/g, '').length !== 10)) {
            showError('phone', 'Enter 10 digits after +7. Spaces, brackets and hyphens are allowed.');
        }
        if (!document.getElementById('terms').checked) {
            showError('terms', 'Please agree to the booking terms.');
        }

        const firstInvalid = bookingForm.querySelector('[aria-invalid="true"]');
        if (firstInvalid) {
            statusMessage.textContent = 'Please correct the highlighted fields.';
            statusMessage.classList.add('error');
            firstInvalid.focus();
            return;
        }

        statusMessage.textContent = 'Validation passed! This is a demo: no account or booking was created.';
        statusMessage.classList.add('success');
        // Passwords are never stored or transmitted; clear them after validation.
        document.getElementById('password').value = '';
        document.getElementById('confirm-password').value = '';
        statusMessage.focus();
    });

    bookingForm.addEventListener('reset', clearErrors);
}
