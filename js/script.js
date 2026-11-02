$(document).ready(function () {
    console.log('jQuery is ready!');
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
                showNotification('Demo subscription confirmed. No email was sent.');
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
    const filterForm = document.getElementById('filter-form');
    const $searchInput = $('#hotel-search');
    const $suggestions = $('#search-suggestions');
    let activeSuggestion = -1;

    function highlightMatches(element, query) {
        const originalText = $(element).text();
        const lowerText = originalText.toLowerCase();
        const lowerQuery = query.toLowerCase();
        let start = 0;
        let match = lowerText.indexOf(lowerQuery);

        if (!query || match === -1) {
            return;
        }

        $(element).empty();

        while (match !== -1) {
            element.appendChild(document.createTextNode(originalText.slice(start, match)));
            $('<mark>').text(originalText.slice(match, match + query.length)).appendTo(element);
            start = match + query.length;
            match = lowerText.indexOf(lowerQuery, start);
        }

        element.appendChild(document.createTextNode(originalText.slice(start)));
    }

    function renderHotels(hotels, query) {
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
                        <img src="image/placeholder.svg" data-src="${hotel.image}" class="img-fluid result-image lazy-image" alt="${hotel.name}" width="640" height="400">
                    </div>
                    <div class="col-12 col-lg-8">
                        <div class="card-body p-3 p-lg-4">
                            <h3 class="card-title h5 fw-bold">${hotel.name}</h3>
                            <p class="text-secondary mb-2">${hotel.location} | Rating: ${hotel.rating} ⭐</p>
                            <p class="card-text">${hotel.description}</p>
                            <div class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mt-3">
                                <span class="hotel-price fw-bold text-primary fs-5">$${hotel.price} / night</span>
                                <a href="hotel-detail.html?hotel=${hotel.id}" class="hotel-details-link btn btn-primary btn-sm">View Details</a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            $(card).find('.card-title, .card-body p, .hotel-price, .hotel-details-link').each(function () {
                highlightMatches(this, query);
            });
            hotelsContainer.appendChild(card);
        });
        if (hotels.length === 0) {
            const message = document.createElement('p');
            message.className = 'alert alert-info';
            message.textContent = 'No hotels match your search and filters. Try another keyword or clear the filters.';
            hotelsContainer.appendChild(message);
        }
        loadVisibleImages();
    }

    function applyFilters() {
        const query = $searchInput.val().trim();
        const lowerQuery = query.toLowerCase();
        const rating = filterForm.querySelector('input[name="rating"]:checked').value;
        const needsWifi = $('#wifi').prop('checked');
        const needsPool = $('#pool').prop('checked');
        const needsBreakfast = $('#breakfast').prop('checked');

        const filteredHotels = hotelsDatabase.filter(function (hotel) {
            const searchableText = [hotel.name, hotel.location, hotel.description].join(' ').toLowerCase();
            return searchableText.includes(lowerQuery) &&
                (rating === 'all' || hotel.rating >= Number(rating)) &&
                (!needsWifi || hotel.wifi) &&
                (!needsPool || hotel.pool) &&
                (!needsBreakfast || hotel.breakfast);
        });

        renderHotels(filteredHotels, query);
    }

    function closeSuggestions() {
        $suggestions.prop('hidden', true);
        $searchInput.attr('aria-expanded', 'false').removeAttr('aria-activedescendant');
        activeSuggestion = -1;
    }

    function updateSuggestions() {
        const query = $searchInput.val().trim().toLowerCase();
        $suggestions.empty();
        closeSuggestions();

        if (!query) {
            return;
        }

        const choices = [];
        hotelsDatabase.forEach(function (hotel) {
            choices.push(hotel.name, hotel.location);
        });

        const matches = [...new Set(choices)].filter(function (choice) {
            return choice.toLowerCase().includes(query);
        }).slice(0, 6);

        matches.forEach(function (choice, index) {
            $('<li>')
                .attr('id', 'search-option-' + index)
                .attr('role', 'option')
                .attr('aria-selected', 'false')
                .text(choice)
                .appendTo($suggestions);
        });

        if (matches.length > 0) {
            $suggestions.prop('hidden', false);
            $searchInput.attr('aria-expanded', 'true');
        }
    }

    function chooseSuggestion(option) {
        $searchInput.val($(option).text());
        closeSuggestions();
        applyFilters();
        $searchInput.trigger('focus');
        closeSuggestions();
    }

    if (hotelsContainer && filterForm) {
        const destination = new URLSearchParams(window.location.search).get('destination');
        $searchInput.val(destination || '');
        applyFilters();

        $searchInput.on('input', function () {
            applyFilters();
            updateSuggestions();
        });

        $searchInput.on('focus', updateSuggestions);
        $searchInput.on('blur', closeSuggestions);

        $searchInput.on('keydown', function (event) {
            if (event.key === 'Escape') {
                event.preventDefault();
                closeSuggestions();
                return;
            }

            if (event.key === 'Tab') {
                closeSuggestions();
                return;
            }

            if (event.key === 'Enter') {
                if (activeSuggestion >= 0) {
                    event.preventDefault();
                    chooseSuggestion($suggestions.children().get(activeSuggestion));
                }
                return;
            }

            if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') {
                return;
            }

            event.preventDefault();

            if ($suggestions.prop('hidden')) {
                updateSuggestions();
            }

            const $options = $suggestions.children();
            if ($options.length === 0) {
                return;
            }

            if (event.key === 'ArrowDown') {
                activeSuggestion = (activeSuggestion + 1) % $options.length;
            } else if (activeSuggestion <= 0) {
                activeSuggestion = $options.length - 1;
            } else {
                activeSuggestion--;
            }

            $options.attr('aria-selected', 'false');
            const $active = $options.eq(activeSuggestion).attr('aria-selected', 'true');
            $searchInput.attr('aria-activedescendant', $active.attr('id'));
            $active.get(0).scrollIntoView({ block: 'nearest' });
        });

        $suggestions.on('mousedown', '[role="option"]', function (event) {
            event.preventDefault();
        });

        $suggestions.on('click', '[role="option"]', function () {
            chooseSuggestion(this);
        });

        $(document).on('click', function (event) {
            if (!$(event.target).closest('.hotel-search-box').length) {
                closeSuggestions();
            }
        });

        $(filterForm).on('submit', function (event) {
            event.preventDefault();
            closeSuggestions();
            applyFilters();
        });

        $(filterForm).on('change', applyFilters);

        $(filterForm).on('reset', function () {
            setTimeout(function () {
                $searchInput.val('');
                closeSuggestions();
                applyFilters();
            }, 0);
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
