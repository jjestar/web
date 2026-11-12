(function () {
    'use strict';

    function accounts() {
        const stored = App.read('users', []);
        return Array.isArray(stored)
            ? stored.filter(
                  (account) => account && typeof account === 'object' && typeof account.id === 'string'
              )
            : [];
    }

    function currentUser() {
        try {
            return App.getUser();
        } catch (_) {
            return null;
        }
    }

    function nameError(value) {
        if (!value) return 'Enter your name.';
        if (value.length < 2) return 'Use at least 2 characters for your name.';
        if (value.length > 80) return 'Keep your name to 80 characters or fewer.';
        return '';
    }

    function status(element, message, isError) {
        if (!element) return;
        element.textContent = message;
        element.classList.toggle('is-error', Boolean(isError));
    }

    function announceAuthChange() {
        document.dispatchEvent(new CustomEvent('bookingapp:authchange'));
    }

    function mergeGuestFavorites(userId) {
        const guest = App.read('favorites.guest', []);
        if (!Array.isArray(guest) || guest.length === 0) return true;
        const database = Array.isArray(window.hotelsDatabase)
            ? window.hotelsDatabase
            : typeof hotelsDatabase !== 'undefined' && Array.isArray(hotelsDatabase)
              ? hotelsDatabase
              : [];
        const validIds = new Set(database.map((hotel) => hotel.id));
        const existing = App.read('favorites.' + userId, []);
        const merged = [...new Set((Array.isArray(existing) ? existing : []).concat(guest))].filter(
            (id) => typeof id === 'string' && validIds.has(id)
        );
        try {

            App.write('favorites.' + userId, merged);
            App.remove('favorites.guest');
            document.dispatchEvent(new Event('bookingapp:favoriteschange'));
            return true;
        } catch (_) {
            return false;
        }
    }

    function uniqueId(prefix) {
        if (window.crypto && typeof window.crypto.randomUUID === 'function')
            return prefix + '-' + window.crypto.randomUUID();
        return prefix + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 12);
    }

    function requireCrypto() {
        if (!window.crypto || !window.crypto.subtle) {
            throw new Error('Open BookingApp on its HTTPS website or localhost to use accounts.');
        }
    }

    function makeSalt() {
        requireCrypto();
        return Array.from(window.crypto.getRandomValues(new Uint8Array(16)), (byte) =>
            byte.toString(16).padStart(2, '0')
        ).join('');
    }

    async function passwordHash(password, salt) {
        requireCrypto();
        // This browser-only student project stores a salted digest, never a plain-text password.
        const digest = await window.crypto.subtle.digest(
            'SHA-256',
            new TextEncoder().encode(salt + ':' + password)
        );
        return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
    }

    function signOut() {
        try {
            App.remove('session');
            if (currentUser())
                throw new Error('We could not log you out. Allow browser storage and try again.');
            announceAuthChange();
            window.location.href = 'login.html?signedout=1';
        } catch (error) {
            App.notify(error.message || 'We could not log you out. Try again.', 'error');
        }
    }

    window.BookingAuth = { signOut: signOut };

    function safeBookingUrl(value) {
        if (typeof value !== 'string' || !value) return '';
        try {
            const expected = new URL('booking.html', window.location.href);
            const candidate = new URL(value, window.location.href);
            if (candidate.origin !== expected.origin || candidate.pathname !== expected.pathname) return '';
            const params = {};
            [
                'hotel',
                'checkin',
                'checkout',
                'guests',
                'room',
                'service',
                'serviceTier',
                'serviceQuantity'
            ].forEach((key) => {
                if (candidate.searchParams.has(key)) params[key] = candidate.searchParams.get(key);
            });
            return App.url('booking.html', params);
        } catch (_) {
            return '';
        }
    }

    function preserveBookingPlan() {
        const next = safeBookingUrl(new URLSearchParams(window.location.search).get('next'));
        if (!next) return;
        try {
            App.write('pendingBookingUrl', next);
        } catch (_) {
            /* Auth forms report storage problems on submit. */
        }
        document.querySelectorAll('[data-auth-switch]').forEach((link) => {
            link.href = App.url(link.dataset.authSwitch, { next: next });
        });
    }

    function bindPasswordToggles() {
        document.querySelectorAll('[data-toggle-password]').forEach((button) => {
            button.addEventListener('click', () => {
                const input = document.getElementById(button.dataset.togglePassword);
                if (!input) return;
                const reveal = input.type === 'password';
                input.type = reveal ? 'text' : 'password';
                button.textContent = reveal ? 'Hide password' : 'Show password';
                button.setAttribute('aria-pressed', String(reveal));
            });
        });
    }

    function setBusy(form, busy, label) {
        const button = form.querySelector('button[type="submit"]');
        if (!button) return;
        if (!button.dataset.idleText) button.dataset.idleText = button.textContent;
        button.disabled = busy;
        button.textContent = busy ? label : button.dataset.idleText;
        form.setAttribute('aria-busy', String(busy));
    }

    function bindSignup() {
        const form = document.getElementById('signup-form');
        if (!form) return;
        const output = document.getElementById('signup-status');
        let submitting = false;
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            if (submitting) return;
            status(output, '', false);
            const name = form.elements.namedItem('name').value.trim();
            const email = form.elements.namedItem('email').value.trim().toLowerCase();
            const phone = form.elements.namedItem('phone').value.trim();
            const password = form.elements.namedItem('password').value;
            const confirmation = form.elements.namedItem('confirmPassword').value;
            const issues = {
                'signup-name': nameError(name),
                'signup-email': App.emailError(email),
                'signup-phone': App.phoneError(phone),
                'signup-password': App.passwordError(password),
                'signup-confirm-password': !confirmation
                    ? 'Enter your password again.'
                    : confirmation !== password
                      ? 'The passwords do not match.'
                      : ''
            };
            if (
                !issues['signup-email'] &&
                accounts().some((account) => String(account.email || '').toLowerCase() === email)
            ) {
                issues['signup-email'] = 'An account with this email already exists. Log in instead.';
            }
            if (App.errors(form, issues)) {
                status(output, 'Check the highlighted fields and try again.', true);
                return;
            }
            submitting = true;
            setBusy(form, true, 'Creating your account…');
            let accountCreated = false;
            try {
                const salt = makeSalt();
                const hash = await passwordHash(password, salt);
                const latestAccounts = accounts();
                // Recheck after the async digest in case another tab created this account.
                if (latestAccounts.some((account) => String(account.email || '').toLowerCase() === email)) {
                    App.errors(form, {
                        'signup-email': 'An account with this email already exists. Log in instead.'
                    });
                    status(output, 'Use your existing account to log in.', true);
                    return;
                }
                const account = {
                    id: uniqueId('user'),
                    name: name,
                    email: email,
                    phone: phone,
                    passwordHash: hash,
                    passwordSalt: salt,
                    createdAt: new Date().toISOString()
                };
                App.write('users', latestAccounts.concat(account));
                accountCreated = true;
                App.write('session', { userId: account.id });
                const favoritesMerged = mergeGuestFavorites(account.id);
                form.reset();
                announceAuthChange();
                status(output, 'Your account is ready. Opening your profile…', false);
                window.location.href = App.url('profile.html', {
                    welcome: 1,
                    saved: favoritesMerged ? '' : 'retry'
                });
            } catch (error) {
                const message = accountCreated
                    ? 'Your account was created, but we could not save your session. Log in again when browser storage is available.'
                    : error.message || 'We could not create your account. Try again.';
                status(output, message, true);
            } finally {
                submitting = false;
                setBusy(form, false, '');
            }
        });
    }

    function bindLogin() {
        const form = document.getElementById('login-form');
        if (!form) return;
        const output = document.getElementById('login-status');
        let submitting = false;
        if (new URLSearchParams(window.location.search).get('signedout') === '1')
            status(output, 'You are logged out.', false);
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            if (submitting) return;
            status(output, '', false);
            const email = form.elements.namedItem('email').value.trim().toLowerCase();
            const password = form.elements.namedItem('password').value;
            const issues = {
                'login-email': App.emailError(email),
                'login-password': password ? '' : 'Enter your password.'
            };
            if (App.errors(form, issues)) {
                status(output, 'Check your email and password, then try again.', true);
                return;
            }
            submitting = true;
            setBusy(form, true, 'Logging in…');
            try {
                const account = accounts().find((item) => String(item.email || '').toLowerCase() === email);
                const isValidAccount =
                    account &&
                    typeof account.passwordSalt === 'string' &&
                    typeof account.passwordHash === 'string';
                const digest = isValidAccount ? await passwordHash(password, account.passwordSalt) : '';
                if (!isValidAccount || digest !== account.passwordHash) {
                    App.errors(form, {
                        'login-password': 'The email or password does not match. Try again.'
                    });
                    status(output, 'We could not log you in with those details.', true);
                    return;
                }
                App.write('session', { userId: account.id });
                const favoritesMerged = mergeGuestFavorites(account.id);
                form.elements.namedItem('password').value = '';
                announceAuthChange();
                status(output, 'Logged in. Opening your profile…', false);
                window.location.href = App.url('profile.html', {
                    saved: favoritesMerged ? '' : 'retry'
                });
            } catch (error) {
                status(output, error.message || 'We could not log you in. Try again.', true);
            } finally {
                submitting = false;
                setBusy(form, false, '');
            }
        });
    }

    function formatDate(value) {
        if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return 'Date unavailable';
        const date = new Date(value + 'T12:00:00');
        return Number.isNaN(date.getTime())
            ? 'Date unavailable'
            : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    function renderFavorites() {
        const container = document.getElementById('profile-favorites');
        if (!container) return;
        let ids = [];
        try {
            ids = App.favoriteIds();
        } catch (_) {
            ids = [];
        }
        if (!Array.isArray(ids)) ids = [];
        const database = Array.isArray(window.hotelsDatabase)
            ? window.hotelsDatabase
            : typeof hotelsDatabase !== 'undefined' && Array.isArray(hotelsDatabase)
              ? hotelsDatabase
              : [];
        const hotels = database.filter((hotel) => ids.includes(hotel.id));
        document.getElementById('saved-count').textContent = String(hotels.length);
        if (!hotels.length) {
            container.className = 'empty-state';
            container.innerHTML =
                '<h3>No saved stays</h3><p class="muted">Save a stay from the search results to compare it here.</p><a class="button button-secondary" href="search-results.html">Explore stays</a>';
            return;
        }
        container.className = 'grid-2';
        container.innerHTML = hotels
            .map(
                (hotel) =>
                    '<article class="card saved-hotel">' +
                    '<img class="image-cover" src="image/placeholder.svg" data-src="' +
                    App.escape(hotel.image) +
                    '" alt="' +
                    App.escape(hotel.name) +
                    '" loading="lazy" width="640" height="400">' +
                    '<div class="stack"><p class="muted">' +
                    App.escape(hotel.location) +
                    '</p><h3>' +
                    App.escape(hotel.name) +
                    '</h3>' +
                    '<p class="price">' +
                    App.escape(App.money(Number(hotel.price) || 0)) +
                    ' <span class="muted">/ night</span></p>' +
                    '<div class="inline"><a class="button button-primary button-small" href="' +
                    App.escape(App.url('hotel-detail.html', { hotel: hotel.id })) +
                    '">View stay</a>' +
                    '<button class="button button-ghost button-small" type="button" data-remove-favorite="' +
                    App.escape(hotel.id) +
                    '" aria-label="Remove ' +
                    App.escape(hotel.name) +
                    ' from saved stays">Remove</button></div></div></article>'
            )
            .join('');
    }

    function bookingRecords() {
        const value = App.read('bookings', []);
        return Array.isArray(value) ? value.filter((booking) => booking && typeof booking === 'object') : [];
    }

    function renderBookings() {
        const container = document.getElementById('profile-bookings');
        const user = currentUser();
        if (!container || !user) return;
        const records = bookingRecords()
            .filter((booking) => booking.userId === user.id)
            .reverse();
        document.getElementById('booking-count').textContent = String(records.length);
        if (!records.length) {
            container.className = 'empty-state';
            container.innerHTML =
                '<h3>No bookings yet</h3><p class="muted">Choose a stay and save a booking to see its dates and price here.</p><a class="button button-secondary" href="search-results.html">Find a stay</a>';
            return;
        }
        container.className = 'stack';
        container.innerHTML = records
            .map((booking) => {
                const cancelled = booking.status === 'cancelled';
                const id = App.escape(String(booking.id || ''));
                const total = Number(booking.total);
                const serviceLabels = {
                    transfer: 'Airport transfer',
                    car: 'Car rental',
                    tour: 'Guided tour'
                };
                const service = serviceLabels[booking.service];
                return (
                    '<article class="panel booking-record" data-booking-record="' +
                    id +
                    '">' +
                    '<div class="inline"><span class="pill">' +
                    (cancelled ? 'Cancelled' : 'Confirmed') +
                    '</span><span class="muted">' +
                    App.escape(String(booking.id || 'Booking')) +
                    '</span></div>' +
                    '<h3>' +
                    App.escape(String(booking.hotelName || 'Hotel stay')) +
                    '</h3>' +
                    '<p>' +
                    App.escape(formatDate(booking.checkin)) +
                    ' — ' +
                    App.escape(formatDate(booking.checkout)) +
                    '</p>' +
                    '<p class="muted">' +
                    App.escape(String(booking.guests || 1)) +
                    ' guest(s) · ' +
                    App.escape(String(booking.room || 'Room')) +
                    (service
                        ? ' · ' +
                          service +
                          (['standard', 'premium', 'vip'].includes(booking.serviceTier)
                              ? ' (' +
                                App.escape(booking.serviceTier === 'vip' ? 'VIP' : booking.serviceTier) +
                                ')'
                              : '')
                        : '') +
                    '</p>' +
                    '<p class="price">' +
                    App.escape(App.money(Number.isFinite(total) ? total : 0)) +
                    ' <span class="muted">total</span></p>' +
                    (cancelled
                        ? '<p class="muted">This booking has been cancelled. No payment was taken.</p>'
                        : '<button class="button button-ghost button-small" type="button" data-cancel-booking="' +
                          id +
                          '">Cancel booking</button>' +
                          '<div class="cancel-confirmation stack" data-confirmation="' +
                          id +
                          '" hidden><p>Cancel this booking? It will stay in your history as cancelled.</p><div class="inline">' +
                          '<button class="button button-secondary button-small" type="button" data-confirm-cancel="' +
                          id +
                          '">Cancel booking</button>' +
                          '<button class="button button-ghost button-small" type="button" data-keep-booking="' +
                          id +
                          '">Keep booking</button></div></div>') +
                    '</article>'
                );
            })
            .join('');
    }

    function bindProfile() {
        const content = document.getElementById('profile-content');
        if (!content) return;
        const user = currentUser();
        document.getElementById('profile-guest').hidden = Boolean(user);
        content.hidden = !user;
        if (!user) return;
        const pending = safeBookingUrl(App.read('pendingBookingUrl', ''));
        if (pending) {
            document.getElementById('pending-booking').hidden = false;
            document.getElementById('continue-booking').href = pending;
        }
        const form = document.getElementById('profile-form');
        const output = document.getElementById('profile-status');
        document.getElementById('profile-name-heading').textContent = 'Trips and saved stays';
        document.getElementById('profile-email').textContent = String(user.email || 'Email unavailable');
        form.elements.namedItem('name').value = String(user.name || '');
        form.elements.namedItem('phone').value = String(user.phone || '');
        if (new URLSearchParams(window.location.search).get('welcome') === '1')
            status(output, 'Account created. You can now save stays and bookings.', false);
        if (new URLSearchParams(window.location.search).get('saved') === 'retry') {
            status(
                output,
                'You are logged in, but your guest saved stays could not be moved. They are still saved in this browser. Free some storage space and log in again to retry.',
                true
            );
        }
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const name = form.elements.namedItem('name').value.trim();
            const phone = form.elements.namedItem('phone').value.trim();
            if (
                App.errors(form, {
                    'profile-name': nameError(name),
                    'profile-phone': App.phoneError(phone)
                })
            ) {
                status(output, 'Check the highlighted fields and try again.', true);
                return;
            }
            try {
                const activeUser = currentUser();
                if (!activeUser || activeUser.id !== user.id)
                    throw new Error('Your session changed. Log in again to update your details.');
                const latest = accounts();
                if (!latest.some((account) => account.id === user.id))
                    throw new Error('Your account could not be found. Log in again.');
                App.write(
                    'users',
                    latest.map((account) =>
                        account.id === user.id ? { ...account, name: name, phone: phone } : account
                    )
                );
                document.getElementById('profile-name-heading').textContent = 'Trips and saved stays';
                status(output, 'Details saved.', false);
                announceAuthChange();
            } catch (error) {
                status(output, error.message || 'We could not save your details. Try again.', true);
            }
        });
        renderFavorites();
        renderBookings();
        document.getElementById('profile-favorites').addEventListener('click', (event) => {
            const button = event.target.closest('[data-remove-favorite]');
            if (!button) return;
            try {
                if (currentUser()?.id !== user.id)
                    throw new Error('Your session changed. Log in again to update your saved stays.');
                App.toggleFavorite(button.dataset.removeFavorite);
                renderFavorites();
                status(document.getElementById('saved-status'), 'Stay removed from saved stays.', false);
                const next = document.querySelector('#profile-favorites button, #profile-favorites a');
                if (next) next.focus();
            } catch (error) {
                status(
                    document.getElementById('saved-status'),
                    error.message || 'We could not update your saved stays.',
                    true
                );
            }
        });
        document.getElementById('profile-bookings').addEventListener('click', (event) => {
            const button = event.target.closest('button');
            if (!button) return;
            const record = button.closest('[data-booking-record]');
            if (!record) return;
            const confirmation = record.querySelector('[data-confirmation]');
            const cancelButton = record.querySelector('[data-cancel-booking]');
            if (button.hasAttribute('data-cancel-booking')) {
                cancelButton.hidden = true;
                confirmation.hidden = false;
                const prompt = confirmation.querySelector('p');
                prompt.id = 'cancel-message-' + record.dataset.bookingRecord;
                confirmation.setAttribute('role', 'group');
                confirmation.setAttribute('aria-labelledby', prompt.id);
                confirmation
                    .querySelectorAll('button')
                    .forEach((action) => action.setAttribute('aria-describedby', prompt.id));
                confirmation.querySelector('[data-keep-booking]').focus();
            } else if (button.hasAttribute('data-keep-booking')) {
                confirmation.hidden = true;
                cancelButton.hidden = false;
                cancelButton.focus();
            } else if (button.hasAttribute('data-confirm-cancel')) {
                try {
                    const activeUser = currentUser();
                    if (!activeUser || activeUser.id !== user.id)
                        throw new Error('Log in again before changing this booking.');
                    const latest = bookingRecords();
                    const target = latest.find(
                        (booking) =>
                            booking.id === button.dataset.confirmCancel && booking.userId === activeUser.id
                    );
                    if (!target)
                        throw new Error(
                            'This booking is no longer available. Refresh the page to update your history.'
                        );
                    App.write(
                        'bookings',
                        latest.map((booking) =>
                            booking === target ? { ...booking, status: 'cancelled' } : booking
                        )
                    );
                    renderBookings();
                    const message = document.getElementById('bookings-status');
                    status(message, 'Your booking has been cancelled. No payment was taken.', false);
                    message.focus();
                } catch (error) {
                    status(
                        document.getElementById('bookings-status'),
                        error.message || 'We could not cancel this booking. Try again.',
                        true
                    );
                }
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        if (!window.App) return;
        preserveBookingPlan();
        bindPasswordToggles();
        bindSignup();
        bindLogin();
        bindProfile();
        document.addEventListener('click', (event) => {
            if (event.target.closest('[data-auth-logout]')) signOut();
        });
    });
})();
