/* Home/search assignment interactions, saved filters and dynamic hotel results. */
jQuery(function ($) {
    // Keep focus in the input while jQuery builds and updates its suggestion list.
    function hotelSuggestions(input, list, onChoose = () => {}) {
        const $input = $(input),
            $list = $(list),
            box = input.closest('.hotel-search-box');
        const choices = [
            ...new Set(hotelsDatabase.flatMap((hotel) => [hotel.name, hotel.location, hotel.city]))
        ];
        let active = -1;
        function close() {
            $list.prop('hidden', true);
            $input.attr('aria-expanded', 'false').removeAttr('aria-activedescendant');
            $list.children().attr('aria-selected', 'false');
            active = -1;
        }
        function update() {
            const keyword = $input.val().trim().toLowerCase();
            close();
            $list.empty();
            if (!keyword) return;
            choices
                .filter((choice) => choice.toLowerCase().includes(keyword))
                .slice(0, 8)
                .forEach((choice, index) => {
                    $('<li>', {
                        id: list.id + '-option-' + index,
                        role: 'option',
                        'aria-selected': 'false',
                        text: choice
                    }).appendTo($list);
                });
            if ($list.children().length) {
                $list.prop('hidden', false);
                $input.attr('aria-expanded', 'true');
            }
        }
        function choose(option) {
            $input.val($(option).text());
            close();
            onChoose();
            input.focus();
            close();
        }
        $input.on('input.suggestions focus.suggestions', update);
        $input.on('blur.suggestions', close);
        $input.on('keydown.suggestions', (event) => {
            if (event.key === 'Escape' || event.key === 'Tab') {
                if (event.key === 'Escape' && !$list.prop('hidden')) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                close();
                return;
            }
            if (event.key === 'Enter') {
                if (active >= 0 && !$list.prop('hidden')) {
                    event.preventDefault();
                    choose($list.children().get(active));
                } else close();
                return;
            }
            if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return;
            event.preventDefault();
            if ($list.prop('hidden')) update();
            const $options = $list.children();
            if (!$options.length) return;
            active =
                event.key === 'ArrowDown'
                    ? (active + 1) % $options.length
                    : active <= 0
                      ? $options.length - 1
                      : active - 1;
            $options.attr('aria-selected', 'false');
            const $option = $options.eq(active).attr('aria-selected', 'true');
            $input.attr('aria-activedescendant', $option.attr('id'));
            $option.get(0).scrollIntoView({ block: 'nearest' });
        });
        $list.on('pointerdown.suggestions', '[role="option"]', (event) => event.preventDefault());
        $list.on('click.suggestions', '[role="option"]', function () {
            choose(this);
        });
        $(document).on('pointerdown.suggestions', (event) => {
            if (!box.contains(event.target)) close();
        });
        return close;
    }

    // Native modal focus containment and Escape behavior complement the inline form.
    const modal = document.createElement('dialog');
    modal.id = 'popup-modal';
    modal.className = 'newsletter-dialog';
    modal.setAttribute('aria-labelledby', 'popup-title');
    modal.setAttribute('aria-describedby', 'popup-description');
    modal.innerHTML = `<button id="close-popup-btn" class="icon-button newsletter-close" type="button" aria-label="Close newsletter dialog">${App.icon('close')}</button>
        <h2 id="popup-title">Subscribe for discounts</h2>
        <p id="popup-description" class="muted">Save your newsletter preference on this device. This student project stores preferences on this device and does not send emails.</p>
        <form id="popup-subscribe-form" class="stack" novalidate>
            <div class="field"><label for="popup-email">Email address</label><input id="popup-email" name="email" type="text" inputmode="email" autocomplete="email" placeholder="you@example.com" aria-describedby="popup-email-error" /><p id="popup-email-error" class="field-error" hidden></p></div>
            <button class="button button-primary" type="submit">Save preference</button>
            <p id="popup-subscribe-status" class="form-status" role="status"></p>
        </form>`;
    document.body.appendChild(modal);
    let popupTrigger, previousOverflow;
    App.showNewsletterModal = (trigger = document.activeElement) => {
        if (modal.open) return;
        popupTrigger = trigger;
        previousOverflow = document.body.style.overflow;
        App.errors(document.getElementById('popup-subscribe-form'), {});
        $('#popup-subscribe-status').text('').removeClass('success error');
        $('#popup-email').val(App.read('newsletter', null)?.email || '');
        modal.showModal();
        document.body.style.overflow = 'hidden';
        document.getElementById('popup-email').focus();
    };
    $('[data-newsletter-open]').on('click', function () {
        App.showNewsletterModal(this);
    });
    $('#close-popup-btn').on('click', () => modal.close());
    modal.addEventListener('keydown', (event) => {
        if (event.key !== 'Tab') return;
        const controls = [
            ...modal.querySelectorAll('button:not(:disabled), input:not(:disabled), a[href]')
        ].filter((control) => control.getClientRects().length);
        const first = controls[0],
            last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    });
    modal.addEventListener('click', (event) => {
        const bounds = modal.getBoundingClientRect();
        if (
            event.target === modal &&
            (event.clientX < bounds.left ||
                event.clientX > bounds.right ||
                event.clientY < bounds.top ||
                event.clientY > bounds.bottom)
        )
            modal.close();
    });
    modal.addEventListener('close', () => {
        document.body.style.overflow = previousOverflow || '';
        if (popupTrigger?.isConnected) popupTrigger.focus();
    });

    const carouselElement = document.getElementById('destinationCarousel');
    if (carouselElement && window.bootstrap?.Carousel) {
        const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
        const carousel = new bootstrap.Carousel(carouselElement, {
            interval: 6000,
            ride: false,
            pause: false,
            keyboard: false,
            touch: true
        });
        const playback = document.getElementById('carousel-playback');
        const slides = [...carouselElement.querySelectorAll('.carousel-item')];
        const indicators = [...carouselElement.querySelectorAll('[data-carousel-slide]')];
        let playing = !reducedMotion.matches,
            hovered = false;
        function syncPlayback() {
            const disabled = reducedMotion.matches;
            playback.disabled = disabled;
            playback.textContent = disabled ? 'Autoplay off' : playing ? 'Pause slideshow' : 'Play slideshow';
            playback.setAttribute(
                'aria-label',
                disabled ? 'Autoplay off: reduced motion is enabled' : playback.textContent
            );
            if (playing && !disabled && !hovered && !document.hidden) carousel.cycle();
            else carousel.pause();
        }
        function pause() {
            playing = false;
            syncPlayback();
        }
        function syncSlide(index) {
            slides.forEach((slide, position) => {
                slide.inert = position !== index;
                slide.setAttribute('aria-hidden', String(position !== index));
            });
            indicators.forEach((indicator, position) => {
                if (position === index) indicator.setAttribute('aria-current', 'true');
                else indicator.removeAttribute('aria-current');
            });
        }
        $('#carousel-prev').on('click', () => {
            pause();
            carousel.prev();
        });
        $('#carousel-next').on('click', () => {
            pause();
            carousel.next();
        });
        $('[data-carousel-slide]').on('click', function () {
            pause();
            carousel.to(Number(this.dataset.carouselSlide));
        });
        $(playback).on('click', () => {
            playing = !playing;
            syncPlayback();
        });
        carouselElement.addEventListener('mouseenter', () => {
            hovered = true;
            syncPlayback();
        });
        carouselElement.addEventListener('mouseleave', () => {
            hovered = false;
            syncPlayback();
        });
        carouselElement.addEventListener('focusin', (event) => {
            if (event.target !== playback) pause();
        });
        carouselElement.addEventListener('slide.bs.carousel', (event) => syncSlide(event.to));
        carouselElement.addEventListener('slid.bs.carousel', (event) => {
            syncSlide(event.to);
            if (!playing) $('#carousel-status').text(slides[event.to].getAttribute('aria-label'));
        });
        reducedMotion.addEventListener('change', () => {
            if (reducedMotion.matches) playing = false;
            syncPlayback();
        });
        document.addEventListener('visibilitychange', syncPlayback);
        syncSlide(0);
        syncPlayback();
    }

    const home = document.getElementById('home-search');
    const readObject = (key) => {
        const value = App.read(key, {});
        return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    };
    function persist(key, value) {
        try {
            App.write(key, value);
        } catch (error) {
            App.notify(error.message, 'error');
        }
    }
    if (home) {
        const closeHomeSuggestions = hotelSuggestions(
            document.getElementById('destination'),
            document.getElementById('destination-suggestions')
        );
        const saved = readObject('search');
        ['destination', 'checkin', 'checkout', 'guests'].forEach((id) => {
            if (saved[id]) home.elements[id].value = saved[id];
        });
        home.addEventListener('submit', (event) => {
            event.preventDefault();
            closeHomeSuggestions();
            const data = Object.fromEntries(new FormData(home));
            data.destination = data.destination.trim();
            const errors = App.dateErrors(data.checkin, data.checkout);
            if (!data.destination) errors.destination = 'Choose a city, country or hotel to explore.';
            if (!/^[1-6]$/.test(data.guests)) errors.guests = 'Choose between 1 and 6 guests.';
            const status = document.getElementById('home-search-status');
            if (App.errors(home, errors)) {
                status.textContent = 'Check the highlighted fields before searching.';
                status.classList.add('error');
                return;
            }
            persist('search', data);
            persist('filters', {});
            location.href = App.url('search-results.html', data);
        });
    }
    function bindSubscription(formId, emailId, statusId) {
        const subscribe = document.getElementById(formId);
        if (!subscribe) return;
        const previous = App.read('newsletter', null);
        if (previous?.email) subscribe.querySelector('input').value = previous.email;
        $(subscribe).on('submit', (event) => {
            event.preventDefault();
            const email = document.getElementById(emailId).value.trim();
            const status = document.getElementById(statusId);
            status.classList.remove('error', 'success');
            if (App.errors(subscribe, { [emailId]: App.emailError(email) })) {
                status.textContent = 'Check your email address.';
                status.classList.add('error');
                return;
            }
            try {
                App.write('newsletter', { email, createdAt: new Date().toISOString() });
                status.textContent = 'Preference saved on this device. No email was sent.';
                status.classList.add('success');
                $('#subscribe-email, #popup-email').val(email);
                if (!modal.open) App.notify('Newsletter preference saved.');
            } catch (error) {
                status.textContent = error.message;
                status.classList.add('error');
            }
        });
    }
    bindSubscription('subscribe-form', 'subscribe-email', 'subscribe-status');
    bindSubscription('popup-subscribe-form', 'popup-email', 'popup-subscribe-status');
    const container = document.getElementById('hotels-container');
    if (!container) return;
    const form = document.getElementById('filter-form'),
        search = document.getElementById('hotel-search'),
        sort = document.getElementById('sort-hotels');
    const query = new URLSearchParams(location.search),
        saved = readObject('filters'),
        trip = readObject('search');
    ['destination', 'checkin', 'checkout', 'guests'].forEach((key) => {
        if (query.has(key)) trip[key] = query.get(key);
    });
    if (query.has('destination')) {
        search.value = query.get('destination');
    } else {
        search.value = saved.query || '';
    }
    if (!query.has('destination')) {
        const radio = form.querySelector(
            `input[name="rating"][value="${['4', '5'].includes(saved.rating) ? saved.rating : 'all'}"]`
        );
        radio.checked = true;
        ['wifi', 'pool', 'breakfast', 'saved-only'].forEach(
            (id) => (document.getElementById(id).checked = Boolean(saved[id]))
        );
        if (['recommended', 'price-asc', 'price-desc', 'rating'].includes(saved.sort))
            sort.value = saved.sort;
    }
    if (trip.checkin && trip.checkout && !Object.keys(App.dateErrors(trip.checkin, trip.checkout)).length) {
        const guests = /^[1-6]$/.test(String(trip.guests)) ? trip.guests : 2;
        document.getElementById('search-trip-context').textContent =
            `Your dates: ${trip.checkin} — ${trip.checkout} · ${guests} ${Number(guests) === 1 ? 'guest' : 'guests'}. Dates carry through to your booking.`;
    }
    function highlight(text, keyword) {
        const value = String(text);
        if (!keyword) return App.escape(value);
        const lower = value.toLowerCase(),
            needle = keyword.toLowerCase();
        let cursor = 0,
            start = lower.indexOf(needle),
            result = '';
        while (start >= 0) {
            result +=
                App.escape(value.slice(cursor, start)) +
                '<mark>' +
                App.escape(value.slice(start, start + keyword.length)) +
                '</mark>';
            cursor = start + keyword.length;
            start = lower.indexOf(needle, cursor);
        }
        return result + App.escape(value.slice(cursor));
    }
    function render() {
        const state = {
            query: search.value.trim(),
            rating: form.querySelector('[name=rating]:checked').value,
            sort: sort.value
        };
        ['wifi', 'pool', 'breakfast', 'saved-only'].forEach(
            (id) => (state[id] = document.getElementById(id).checked)
        );
        persist('filters', state);
        const favorites = App.favoriteIds();
        let hotels = hotelsDatabase.filter(
            (hotel) =>
                [hotel.name, hotel.location, hotel.description]
                    .join(' ')
                    .toLowerCase()
                    .includes(state.query.toLowerCase()) &&
                (state.rating === 'all' || hotel.rating >= Number(state.rating)) &&
                (!state.wifi || hotel.wifi) &&
                (!state.pool || hotel.pool) &&
                (!state.breakfast || hotel.breakfast) &&
                (!state['saved-only'] || favorites.includes(hotel.id))
        );
        if (state.sort === 'price-asc') hotels.sort((a, b) => a.price - b.price);
        if (state.sort === 'price-desc') hotels.sort((a, b) => b.price - a.price);
        if (state.sort === 'rating') hotels.sort((a, b) => b.rating - a.rating);
        document.getElementById('results-count').textContent =
            `${hotels.length} ${hotels.length === 1 ? 'stay' : 'stays'} found`;
        $(container).html(
            hotels.length
                ? hotels
                      .map((hotel) => {
                          const href = App.url('hotel-detail.html', {
                              hotel: hotel.id,
                              checkin: trip.checkin,
                              checkout: trip.checkout,
                              guests: trip.guests
                          });
                          const saved = favorites.includes(hotel.id);
                          return `<article class="stay-card">
    <div class="stay-image"><a href="${App.escape(href)}" tabindex="-1" aria-hidden="true"><img src="image/placeholder.svg" data-src="${App.escape(hotel.image)}" alt="${App.escape(hotel.photos[0].alt)}" width="480" height="280" loading="lazy"></a></div>
    <div class="stay-body">
        <div class="stay-copy">
            <p class="stay-location">${highlight(hotel.location, state.query)}</p>
            <div class="stay-title"><h3><a href="${App.escape(href)}">${highlight(hotel.name, state.query)}</a></h3><button type="button" class="icon-button favorite-button" data-save="${hotel.id}" aria-label="${saved ? 'Unsave' : 'Save'} ${App.escape(hotel.name)}" aria-pressed="${saved}">${App.icon('heart')}</button></div>
            <p class="description">${highlight(hotel.description, state.query)}</p>
            <div class="stay-amenities"><span>${highlight(hotel.rating + '-star category', state.query)}</span>${hotel.wifi ? '<span>' + highlight('Wi-Fi', state.query) + '</span>' : ''}${hotel.pool ? '<span>' + highlight('Pool', state.query) + '</span>' : ''}${hotel.breakfast ? '<span>' + highlight('Breakfast', state.query) + '</span>' : ''}</div>
        </div>
        <div class="stay-bottom"><div class="price">${highlight(App.money(hotel.price), state.query)} <small>/ night</small></div><a class="button button-secondary button-small" href="${App.escape(href)}">${highlight('View stay', state.query)} ${App.icon('arrow')}</a></div>
    </div>
</article>`;
                      })
                      .join('')
                : '<div class="empty-state" style="grid-column:1/-1"><h3>No matching stays</h3><p>Try another destination or clear the filters.</p><button class="button button-primary" type="button" id="clear-empty">Clear filters</button></div>'
        );
        document.getElementById('clear-empty')?.addEventListener('click', () => form.reset());
        container.querySelectorAll('[data-save]').forEach((button) =>
            button.addEventListener('click', () => {
                try {
                    const active = App.toggleFavorite(button.dataset.save);
                    App.notify(
                        active ? 'Stay saved. Find it in My trips.' : 'Stay removed from saved stays.'
                    );
                    if (state['saved-only']) {
                        render();
                        document.getElementById('results-count').setAttribute('tabindex', '-1');
                        document.getElementById('results-count').focus();
                    } else {
                        button.setAttribute('aria-pressed', String(active));
                        const hotel = hotelsDatabase.find((h) => h.id === button.dataset.save);
                        button.setAttribute('aria-label', `${active ? 'Unsave' : 'Save'} ${hotel.name}`);
                    }
                } catch (error) {
                    App.notify(error.message, 'error');
                }
            })
        );
    }
    const closeSearchSuggestions = hotelSuggestions(
        search,
        document.getElementById('search-suggestions'),
        render
    );
    $(search).on('input.filters', render);
    $(form).on('change', (event) => {
        if (event.target !== search) render();
    });
    $(sort).on('change', render);
    $(form).on('submit', (event) => {
        event.preventDefault();
        closeSearchSuggestions();
        render();
    });
    $(form).on('reset', () => {
        closeSearchSuggestions();
        setTimeout(() => {
            search.value = '';
            sort.value = 'recommended';
            history.replaceState(
                null,
                '',
                App.url('search-results.html', {
                    checkin: trip.checkin,
                    checkout: trip.checkout,
                    guests: trip.guests
                })
            );
            render();
        }, 0);
    });
    render();
});
