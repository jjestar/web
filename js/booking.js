const readMoreButton = document.getElementById('hotel-read-more');

if (readMoreButton) {
    const moreInformation = document.getElementById('hotel-more');

    readMoreButton.addEventListener('click', function () {
        const isOpen = readMoreButton.getAttribute('aria-expanded') === 'true';
        moreInformation.style.display = isOpen ? 'none' : 'block';
        moreInformation.setAttribute('aria-hidden', String(isOpen));
        readMoreButton.setAttribute('aria-expanded', String(!isOpen));
        readMoreButton.textContent = isOpen ? 'Read More' : 'Read Less';
    });
}

// The identifier from Search chooses the same hotel on both pages.
const selectedHotel = getSelectedHotel();
document.querySelectorAll('a[href="booking.html"]').forEach(function (link) {
    link.href = 'booking.html?hotel=' + selectedHotel.id;
});
document.querySelectorAll('a[href="hotel-detail.html"]').forEach(function (link) {
    link.href = 'hotel-detail.html?hotel=' + selectedHotel.id;
});

const hotelName = document.getElementById('hotel-name');
if (hotelName) {
    document.title = 'BookingApp - ' + selectedHotel.name;
    hotelName.textContent = selectedHotel.name;
    document.getElementById('hotel-location').textContent = selectedHotel.location + ' | ' + selectedHotel.rating + ' stars';
    document.getElementById('hotel-description').textContent = selectedHotel.description;
    document.getElementById('hotel-price').textContent = 'Rooms from $' + selectedHotel.price + ' per night';
    document.getElementById('hotel-breakfast').textContent = selectedHotel.breakfast
        ? 'Breakfast is included.' : 'Check room options before booking.';

    const amenitiesList = document.getElementById('hotel-amenities');
    amenitiesList.replaceChildren();
    selectedHotel.amenities.forEach(function (amenity) {
        const item = document.createElement('li');
        item.className = 'list-group-item';
        item.textContent = amenity;
        amenitiesList.appendChild(item);
    });
    document.querySelectorAll('.hotel-image').forEach(function (image, index) {
        image.src = selectedHotel.photos[index].src;
        image.alt = selectedHotel.photos[index].alt;
    });
}

const bookingForm = document.getElementById('booking-form');

if (bookingForm) {
    const steps = bookingForm.querySelectorAll('.booking-step');
    const progressItems = document.querySelectorAll('.booking-progress li');
    const backButton = document.getElementById('booking-back');
    const nextButton = document.getElementById('booking-next');
    const confirmButton = document.getElementById('booking-confirm');
    const statusMessage = document.getElementById('booking-status');
    let currentStep = 0;
    document.getElementById('booking-hotel-name').textContent = selectedHotel.name;
    document.title = 'BookingApp - Book ' + selectedHotel.name;

    const bookingSummary = {
        roomPrices: {
            standard: selectedHotel.price,
            deluxe: selectedHotel.price + 40,
            suite: selectedHotel.price + 100
        },
        calculateNights(checkin, checkout) {
            return (new Date(checkout) - new Date(checkin)) / 86400000;
        },
        calculateTotal(room, nights) {
            return this.roomPrices[room] * nights;
        }
    };

    // Labels and the summary use the same selected hotel's room prices.
    Object.keys(bookingSummary.roomPrices).forEach(function (room) {
        const label = bookingForm.querySelector('label[for="' + room + '"]');
        label.textContent = room.charAt(0).toUpperCase() + room.slice(1) + ' · $' + bookingSummary.roomPrices[room];
    });

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

    function validateStep(stepIndex) {
        clearErrors();
        const fields = steps[stepIndex].querySelectorAll('[required]');

        for (let i = 0; i < fields.length; i++) {
            const field = fields[i];
            if (field.type === 'checkbox' && !field.checked) {
                showError(field.id, 'Please agree to the booking terms.');
            } else if (field.type !== 'checkbox' && field.value.trim() === '') {
                showError(field.id, 'Please complete this field.');
            }
        }

        if (stepIndex === 0) {
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const confirmation = document.getElementById('confirm-password').value;
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
            if (phone && (!/^[0-9()\s-]+$/.test(phone) || phone.replace(/\D/g, '').length !== 10)) {
                showError('phone', 'Enter 10 digits after +7. Spaces, brackets and hyphens are allowed.');
            }
        }

        if (stepIndex === 1) {
            const checkin = document.getElementById('checkin').value;
            const checkout = document.getElementById('checkout').value;

            if (checkin && checkout && checkout <= checkin) {
                showError('checkout', 'Check-out must be after the check-in date.');
            }
            if (!bookingForm.querySelector('input[name="room"]:checked')) {
                showError('standard', 'Choose a room type.');
            }
        }

        const firstInvalid = steps[stepIndex].querySelector('[aria-invalid="true"]');
        if (firstInvalid) {
            statusMessage.textContent = 'Please correct the highlighted fields.';
            statusMessage.classList.add('error');
            firstInvalid.focus();
            return false;
        }

        return true;
    }

    function updateSummary() {
        const room = bookingForm.querySelector('input[name="room"]:checked').value;
        const checkin = document.getElementById('checkin').value;
        const checkout = document.getElementById('checkout').value;
        const nights = bookingSummary.calculateNights(checkin, checkout);
        const total = bookingSummary.calculateTotal(room, nights);
        const details = [
            ['Hotel', selectedHotel.name],
            ['Guest', document.getElementById('fullname').value.trim()],
            ['Email', document.getElementById('email').value.trim()],
            ['Phone', '+7 ' + document.getElementById('phone').value.trim()],
            ['Dates', checkin + ' to ' + checkout],
            ['Room', room.charAt(0).toUpperCase() + room.slice(1)],
            ['Guests', document.getElementById('guests').value],
            ['Nights', String(nights)],
            ['Price per night', '$' + bookingSummary.roomPrices[room]],
            ['Estimated total', '$' + total],
            ['Special requests', document.getElementById('notes').value.trim() || 'None']
        ];
        const summary = document.getElementById('booking-summary');
        summary.replaceChildren();

        for (let i = 0; i < details.length; i++) {
            const label = document.createElement('dt');
            const value = document.createElement('dd');
            label.textContent = details[i][0];
            value.textContent = details[i][1];
            summary.append(label, value);
        }
    }

    function showStep(stepIndex) {
        for (let i = 0; i < steps.length; i++) {
            steps[i].hidden = i !== stepIndex;
            progressItems[i].classList.toggle('active', i === stepIndex);
            progressItems[i].removeAttribute('aria-current');
        }

        progressItems[stepIndex].setAttribute('aria-current', 'step');
        backButton.hidden = stepIndex === 0;
        nextButton.hidden = stepIndex === steps.length - 1;
        confirmButton.hidden = stepIndex !== steps.length - 1;

        if (stepIndex === steps.length - 1) {
            updateSummary();
        }

        steps[stepIndex].querySelector('legend').focus();
    }

    function changeStep(direction, onStepChange) {
        const nextStep = currentStep + direction;
        if (nextStep < 0 || nextStep >= steps.length) return;
        if (direction > 0 && !validateStep(currentStep)) return;
        clearErrors();
        currentStep = nextStep;
        onStepChange(currentStep);
    }

    nextButton.addEventListener('click', function () {
        changeStep(1, showStep);
    });

    backButton.addEventListener('click', function () {
        changeStep(-1, showStep);
    });

    bookingForm.addEventListener('submit', function (event) {
        event.preventDefault();

        if (currentStep < steps.length - 1) {
            changeStep(1, showStep);
            return;
        }
        if (!validateStep(currentStep)) return;

        statusMessage.textContent = 'Demo booking confirmed! No account, payment, or reservation was created.';
        statusMessage.classList.add('success');
        document.getElementById('password').value = '';
        document.getElementById('confirm-password').value = '';
        confirmButton.disabled = true;
        backButton.disabled = true;
        statusMessage.focus();
    });

    bookingForm.addEventListener('reset', function () {
        clearErrors();
        currentStep = 0;
        confirmButton.disabled = false;
        backButton.disabled = false;
        document.getElementById('booking-summary').replaceChildren();
        showStep(currentStep);
    });
}

document.addEventListener('DOMContentLoaded', function () {
    const menuLinks = document.querySelectorAll('#mainNav .nav-link');

    for (let index = 0; index < menuLinks.length; index++) {
        menuLinks[index].addEventListener('keydown', function (event) {
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
                case 'Home':
                    nextIndex = 0;
                    break;
                case 'End':
                    nextIndex = menuLinks.length - 1;
                    break;
                default:
                    return;
            }

            event.preventDefault();
            menuLinks[nextIndex].focus();
        });
    }

    const clickSound = new Audio('image/click.mp3');
    clickSound.volume = 0.4;

    document.addEventListener('click', function (event) {
        const button = event.target.closest('button');
        if (button && !button.disabled) {
            clickSound.pause();
            clickSound.currentTime = 0;
            clickSound.play().catch(function () {
                console.warn('The click sound could not be played.');
            });
        }
    });
});
