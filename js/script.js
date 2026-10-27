document.addEventListener('DOMContentLoaded', function () {
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
        openButton.addEventListener('click', function () {
            modal.hidden = false;
            document.body.style.overflow = 'hidden';
            emailInput.focus();
        });
        closeButton.addEventListener('click', closePopup);
        modal.addEventListener('click', function (event) {
            if (event.target === modal) {
                closePopup();
            }
        });
        document.addEventListener('keydown', function (event) {
            if (modal.hidden) {
                return;
            }
            if (event.key === 'Escape') {
                closePopup();
            }
            if (event.key === 'Tab') {
                const lastButton = modal.querySelector('button[type="submit"]');
                if (event.shiftKey && document.activeElement === closeButton) {
                    event.preventDefault();
                    lastButton.focus();
                } else if (!event.shiftKey && document.activeElement === lastButton) {
                    event.preventDefault();
                    closeButton.focus();
                }
            }
        });
    }

    const subscribeForm = document.getElementById('subscribe-form');
    if (subscribeForm) {
        const emailError = document.getElementById('email-error');
        const subscribeStatus = document.getElementById('subscribe-status');
        subscribeForm.addEventListener('submit', function (event) {
            event.preventDefault();
            const email = emailInput.value.trim();
            let message = '';
            if (email === '') {
                message = 'Email is required.';
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                message = 'Please enter a valid email address.';
            }
            emailError.textContent = message;
            emailError.hidden = message === '';
            emailInput.setAttribute('aria-invalid', String(message !== ''));
            subscribeStatus.textContent = '';
            if (message) {
                emailInput.focus();
            } else {
                subscribeStatus.textContent = 'Thank you! The demo subscription was validated. No email was sent.';
                subscribeForm.reset();
            }
        });
    }

    const faqButtons = document.querySelectorAll('.accordion-header');
    faqButtons.forEach(function (button, index) {
        const answer = button.nextElementSibling;
        answer.id = 'faq-answer-' + index;
        button.setAttribute('aria-controls', answer.id);
        button.addEventListener('click', function () {
            const isOpen = button.getAttribute('aria-expanded') === 'true';
            button.setAttribute('aria-expanded', String(!isOpen));
            answer.setAttribute('aria-hidden', String(isOpen));
            answer.style.maxHeight = isOpen ? '0px' : answer.scrollHeight + 'px';
        });
    });
    window.addEventListener('resize', function () {
        faqButtons.forEach(function (button) {
            if (button.getAttribute('aria-expanded') === 'true') {
                const answer = button.nextElementSibling;
                answer.style.maxHeight = answer.scrollHeight + 'px';
            }
        });
    });

    const themeButton = document.getElementById('change-bg-btn');
    if (themeButton) {
        const colors = ['#f4f6f8', '#e2e8f0', '#fef3c7', '#e0f2fe', '#f3e8ff'];
        let colorIndex = 0;
        themeButton.addEventListener('click', function () {
            colorIndex = (colorIndex + 1) % colors.length;
            document.body.style.backgroundColor = colors[colorIndex];
        });
    }

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

    const hotelsContainer = document.getElementById('hotels-container');
    const resultsCount = document.getElementById('results-count');

    function renderHotels(hotels) {
        if (!hotelsContainer) {
            return;
        }
        hotelsContainer.innerHTML = '';
        resultsCount.textContent = hotels.length + (hotels.length === 1 ? ' hotel found' : ' hotels found');
        hotels.forEach(function (hotel) {
            const card = document.createElement('article');
            card.className = 'card hotel-card shadow-sm mb-3 overflow-hidden';
            card.innerHTML = `
                <div class="row g-0">
                    <div class="col-12 col-lg-4">
                        <img src="${hotel.image}" class="img-fluid result-image" alt="${hotel.name}">
                    </div>
                    <div class="col-12 col-lg-8">
                        <div class="card-body p-3 p-lg-4">
                            <h3 class="card-title h5 fw-bold">${hotel.name}</h3>
                            <p class="text-secondary mb-2">${hotel.location} | Rating: ${hotel.rating} ⭐</p>
                            <p class="card-text">${hotel.description}</p>
                            <div class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mt-3">
                                <span class="fw-bold text-primary fs-5">$${hotel.price} / night</span>
                                <a href="hotel-detail.html?hotel=${hotel.id}" class="btn btn-primary btn-sm">View Details</a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            hotelsContainer.appendChild(card);
        });
        if (hotels.length === 0) {
            const message = document.createElement('p');
            message.className = 'alert alert-info';
            message.textContent = 'No hotels match these filters. Try another rating or clear the filters.';
            hotelsContainer.appendChild(message);
        }
    }

    if (hotelsContainer) renderHotels(hotelsDatabase);

    const filterForm = document.getElementById('filter-form');
    if (filterForm) {
        filterForm.addEventListener('submit', function (event) {
            event.preventDefault();
            const rating = filterForm.querySelector('input[name="rating"]:checked').value;
            const needsWifi = document.getElementById('wifi').checked;
            const needsPool = document.getElementById('pool').checked;
            const needsBreakfast = document.getElementById('breakfast').checked;
            let filteredHotels;
            switch (rating) {
                case '4':
                    filteredHotels = hotelsDatabase.filter(hotel => hotel.rating >= 4);
                    break;
                case '5':
                    filteredHotels = hotelsDatabase.filter(hotel => hotel.rating === 5);
                    break;
                default:
                    filteredHotels = hotelsDatabase;
            }
            filteredHotels = filteredHotels.filter(function (hotel) {
                return (!needsWifi || hotel.wifi) &&
                    (!needsPool || hotel.pool) &&
                    (!needsBreakfast || hotel.breakfast);
            });
            renderHotels(filteredHotels);
        });
        filterForm.addEventListener('reset', function () {
            renderHotels(hotelsDatabase);
        });
    }

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
