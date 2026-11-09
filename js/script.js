/* Home search, saved filters and dynamic hotel results. */
document.addEventListener('DOMContentLoaded', () => {
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
        const saved = readObject('search');
        ['destination', 'checkin', 'checkout', 'guests'].forEach((id) => {
            if (saved[id]) home.elements[id].value = saved[id];
        });
        home.addEventListener('submit', (event) => {
            event.preventDefault();
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
    const subscribe = document.getElementById('subscribe-form');
    if (subscribe) {
        const previous = App.read('newsletter', null);
        if (previous?.email) subscribe.querySelector('input').value = previous.email;
        subscribe.addEventListener('submit', (event) => {
            event.preventDefault();
            const email = document.getElementById('subscribe-email').value.trim();
            const status = document.getElementById('subscribe-status');
            status.classList.remove('error', 'success');
            if (App.errors(subscribe, { 'subscribe-email': App.emailError(email) })) {
                status.textContent = 'Check your email address.';
                status.classList.add('error');
                return;
            }
            try {
                App.write('newsletter', { email, createdAt: new Date().toISOString() });
                status.textContent = 'Preference saved on this device. No email was sent.';
                status.classList.add('success');
                App.notify('Newsletter preference saved.');
            } catch (error) {
                status.textContent = error.message;
                status.classList.add('error');
            }
        });
    }
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
        const escaped = App.escape(text);
        if (!keyword) return escaped;
        const start = String(text).toLowerCase().indexOf(keyword.toLowerCase());
        if (start < 0) return escaped;
        return (
            App.escape(String(text).slice(0, start)) +
            '<mark>' +
            App.escape(String(text).slice(start, start + keyword.length)) +
            '</mark>' +
            App.escape(String(text).slice(start + keyword.length))
        );
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
        container.innerHTML = hotels.length
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
    <div class="stay-image"><a href="${App.escape(href)}" tabindex="-1" aria-hidden="true"><img src="${App.escape(hotel.image)}" alt="${App.escape(hotel.photos[0].alt)}" width="480" height="280" loading="lazy"></a></div>
    <div class="stay-body">
        <div class="stay-copy">
            <p class="stay-location">${highlight(hotel.location, state.query)}</p>
            <div class="stay-title"><h3><a href="${App.escape(href)}">${highlight(hotel.name, state.query)}</a></h3><button type="button" class="icon-button favorite-button" data-save="${hotel.id}" aria-label="${saved ? 'Unsave' : 'Save'} ${App.escape(hotel.name)}" aria-pressed="${saved}">${App.icon('heart')}</button></div>
            <p class="description">${highlight(hotel.description, state.query)}</p>
            <div class="stay-amenities"><span>${hotel.rating}-star category</span>${hotel.wifi ? '<span>Wi-Fi</span>' : ''}${hotel.pool ? '<span>Pool</span>' : ''}${hotel.breakfast ? '<span>Breakfast</span>' : ''}</div>
        </div>
        <div class="stay-bottom"><div class="price">${App.money(hotel.price)} <small>/ night</small></div><a class="button button-secondary button-small" href="${App.escape(href)}">View stay ${App.icon('arrow')}</a></div>
    </div>
</article>`;
                  })
                  .join('')
            : '<div class="empty-state" style="grid-column:1/-1"><h3>No matching stays</h3><p>Try another destination or clear the filters.</p><button class="button button-primary" type="button" id="clear-empty">Clear filters</button></div>';
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
    search.addEventListener('input', render);
    form.addEventListener('change', (event) => {
        if (event.target !== search) render();
    });
    sort.addEventListener('change', render);
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        render();
    });
    form.addEventListener('reset', () => {
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
