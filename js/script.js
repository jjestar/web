document.addEventListener('DOMContentLoaded', () => {

    // task 3
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
            if (event.key === 'Tab' && !modal.hidden) {
                const controls = modal.querySelectorAll('button, input');
                const first = controls[0];
                const last = controls[controls.length - 1];
                if (event.shiftKey && document.activeElement === first) {
                    event.preventDefault();
                    last.focus();
                } else if (!event.shiftKey && document.activeElement === last) {
                    event.preventDefault();
                    first.focus();
                }
            }
        });
    }

    // task 1
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

    // task 2
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

    // task 4
    const themeButton = document.getElementById('change-bg-btn');
    if (themeButton) {
        const colors = ['#f4f6f8', '#e2e8f0', '#fef3c7', '#e0f2fe', '#f3e8ff'];
        let colorIndex = 0;
        themeButton.addEventListener('click', () => {
            colorIndex = (colorIndex + 1) % colors.length;
            document.body.style.backgroundColor = colors[colorIndex];
        });
    }

    // task 5
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

    // Assignment 5: render the shared array using a for loop.
    const hotelsContainer = document.getElementById('hotels-container');
    const resultCount = document.getElementById('result-count');
    function renderHotels(hotelsArray) {
        if (!hotelsContainer) return;
        hotelsContainer.innerHTML = '';
        resultCount.textContent = hotelsArray.length + ' hotel(s) found';
        for (const hotel of hotelsArray) {
            const article = document.createElement('article');
            article.className = 'card shadow-sm mb-3 overflow-hidden hotel-enter';
            // All interpolated values below come from our local hotel data.
            article.innerHTML = `
                <div class="row g-0">
                    <div class="col-12 col-lg-4">
                        <img src="${hotel.image}" class="img-fluid result-image" alt="${hotel.name}">
                    </div>
                    <div class="col-12 col-lg-8">
                        <div class="card-body p-3 p-lg-4">
                            <h3 class="card-title h5 fw-bold">${hotel.name}</h3>
                            <p class="text-secondary mb-2">${hotel.location} | ${hotel.rating} stars</p>
                            <p class="card-text">${hotel.description}</p>
                            <div class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mt-3">
                                <span class="fw-bold text-primary fs-5">${hotel.getPriceLabel()}</span>
                                <a href="hotel-detail.html?hotel=${hotel.id}" class="btn btn-primary btn-sm">View Details</a>
                            </div>
                        </div>
                    </div>
                </div>`;
            hotelsContainer.appendChild(article);
        }
        if (hotelsArray.length === 0) {
            hotelsContainer.textContent = 'No hotels match. Try another destination or clear the filters.';
        }
    }

    // Assignment 5: switch + filter(callback) handle the user's choices.
    const filterForm = document.getElementById('filter-form');
    if (filterForm) {
        const destinationInput = document.getElementById('filter-destination');
        destinationInput.value = new URLSearchParams(window.location.search).get('destination') || '';

        function applyFilters() {
            const rating = filterForm.querySelector('input[name="rating"]:checked').value;
            let filteredHotels;
            switch (rating) {
                case '4': filteredHotels = hotelsDatabase.filter(hotel => hotel.rating >= 4); break;
                case '5': filteredHotels = hotelsDatabase.filter(hotel => hotel.rating === 5); break;
                default: filteredHotels = hotelsDatabase;
            }
            const destination = destinationInput.value.trim().toLowerCase();
            filteredHotels = filteredHotels.filter(function (hotel) {
                const matchesDestination = (hotel.name + ' ' + hotel.location).toLowerCase().includes(destination);
                const matchesWifi = !document.getElementById('wifi').checked || hotel.wifi;
                const matchesPool = !document.getElementById('pool').checked || hotel.pool;
                const matchesBreakfast = !document.getElementById('breakfast').checked || hotel.breakfast;
                return matchesDestination && matchesWifi && matchesPool && matchesBreakfast;
            });
            renderHotels(filteredHotels);
        }
        filterForm.addEventListener('submit', function (event) {
            event.preventDefault();
            applyFilters();
        });
        document.getElementById('clear-filters').addEventListener('click', function () {
            filterForm.reset();
            destinationInput.value = '';
            applyFilters();
        });
        applyFilters();
    }

    const searchForm = document.getElementById('search-form');
    if (searchForm) {
        const checkin = document.getElementById('checkin');
        const checkout = document.getElementById('checkout');
        function checkDates() {
            checkout.setCustomValidity(checkout.value && checkin.value && checkout.value <= checkin.value
                ? 'Check-out must be after check-in.' : '');
        }
        checkin.addEventListener('input', checkDates);
        checkout.addEventListener('input', checkDates);
    }
});
