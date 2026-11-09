(function () {
    'use strict';

    const hotel = window.getSelectedHotel();
    const detail = document.getElementById('hotel-detail-content');
    const booking = document.getElementById('booking-content');
    if (!detail && !booking) return;

    if (!hotel) {
        document.title = 'Stay not found · BookingApp';
        (detail || booking).innerHTML =
            '<section class="empty-state section"><p class="eyebrow">Stay details</p><h1>Stay not found</h1><p class="muted">This link does not match a demo stay. Explore the collection to choose another.</p><a href="search-results.html" class="button button-primary">Explore stays</a></section>';
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const savedSearch = App.read('search', {});
    const search = savedSearch && typeof savedSearch === 'object' ? savedSearch : {};
    const tripParam = (key) => (params.has(key) ? params.get(key) : search[key] || '');
    const tripParams = {
        hotel: hotel.id,
        checkin: tripParam('checkin'),
        checkout: tripParam('checkout'),
        guests: tripParam('guests'),
        room: params.get('room') || '',
        service: params.get('service') || ''
    };

    if (detail) {
        document.title = hotel.name + ' · BookingApp';
        document.getElementById('hotel-name').textContent = hotel.name;
        document.getElementById('hotel-location').textContent =
            hotel.location + ' · ' + hotel.rating + '-star demo stay';
        document.getElementById('hotel-tag').textContent = hotel.tag;
        document.getElementById('hotel-description').textContent = hotel.description;
        document.getElementById('hotel-price').textContent = App.money(hotel.price);
        document.getElementById('hotel-breakfast').textContent = hotel.breakfast
            ? 'Breakfast is included in this demo rate.'
            : 'Room-only rate. Breakfast is not included.';
        document.getElementById('hotel-book-link').href = App.url('booking.html', tripParams);
        const gallery = document.getElementById('hotel-gallery');
        hotel.photos.forEach((photo, index) => {
            const image = document.createElement('img');
            image.src = photo.src;
            image.alt = photo.alt;
            image.className = 'image-cover';
            image.width = 900;
            image.height = 600;
            if (index > 0) image.loading = 'lazy';
            gallery.append(image);
        });
        const amenities = document.getElementById('hotel-amenities');
        hotel.amenities.forEach((amenity) => {
            const item = document.createElement('li');
            item.textContent = amenity;
            amenities.append(item);
        });
        const favorite = document.getElementById('hotel-favorite');
        function updateFavorite() {
            const saved = App.favoriteIds().includes(hotel.id);
            favorite.setAttribute('aria-pressed', String(saved));
            favorite.innerHTML = App.icon('heart') + (saved ? 'Stay saved' : 'Save stay');
        }
        updateFavorite();
        favorite.addEventListener('click', () => {
            try {
                App.toggleFavorite(hotel.id);
                updateFavorite();
                App.notify(
                    App.favoriteIds().includes(hotel.id)
                        ? 'Stay added to saved stays.'
                        : 'Stay removed from saved stays.'
                );
            } catch (error) {
                App.notify(error.message, 'error');
            }
        });
        window.addEventListener('storage', updateFavorite);
        return;
    }

    const form = document.getElementById('booking-form');
    const steps = [...form.querySelectorAll('.booking-step')];
    const progress = [...document.querySelectorAll('.step-list li')];
    const back = document.getElementById('booking-back');
    const next = document.getElementById('booking-next');
    const confirm = document.getElementById('booking-confirm');
    const status = document.getElementById('booking-status');
    const account = document.getElementById('booking-account');
    const fields = {};
    [
        'checkin',
        'checkout',
        'guests',
        'room',
        'service',
        'fullname',
        'email',
        'phone',
        'notes',
        'terms'
    ].forEach((id) => {
        fields[id] = document.getElementById(id);
    });
    const roomPrices = {
        standard: hotel.price,
        deluxe: hotel.price + 40,
        suite: hotel.price + 100
    };
    const serviceNames = {
        none: 'No extra service',
        transfer: 'Airport transfer',
        car: 'Car rental',
        tour: 'Guided city tour'
    };
    const roomNames = { standard: 'Standard room', deluxe: 'Deluxe room', suite: 'Suite' };
    let currentStep = 0;
    let submitted = false;

    document.title = 'Plan ' + hotel.name + ' · BookingApp';
    document.getElementById('booking-hotel-name').textContent = hotel.name;
    document.getElementById('booking-hotel-location').textContent = hotel.location;
    const hotelImage = document.getElementById('booking-hotel-image');
    hotelImage.src = hotel.image;
    hotelImage.alt = hotel.photos[0].alt;
    document.getElementById('booking-back-to-hotel').href = App.url(
        'hotel-detail.html',
        tripParams
    );
    Object.keys(roomPrices).forEach((room) => {
        fields.room.querySelector('option[value="' + room + '"]').textContent =
            roomNames[room] + ' · ' + App.money(roomPrices[room]) + ' / night';
    });

    const user = App.getUser();
    const savedDraft = App.read('bookingDraft', null);
    const draft =
        savedDraft &&
        savedDraft.hotelId === hotel.id &&
        (!savedDraft.userId || savedDraft.userId === user?.id)
            ? savedDraft
            : null;
    fields.checkin.value = tripParam('checkin') || draft?.checkin || '';
    fields.checkout.value = tripParam('checkout') || draft?.checkout || '';
    fields.guests.value = String(tripParam('guests') || draft?.guests || 2);
    fields.room.value = params.get('room') || draft?.room || 'standard';
    fields.service.value = params.get('service') || draft?.service || 'none';
    fields.fullname.value = draft?.name || user?.name || '';
    fields.email.value = draft?.email || user?.email || '';
    fields.phone.value = draft?.phone || user?.phone || '';
    fields.notes.value = draft?.notes || '';

    function selection() {
        const nights =
            (Date.parse(fields.checkout.value) - Date.parse(fields.checkin.value)) / 86400000;
        const validNights = Number.isInteger(nights) && nights > 0 ? nights : 0;
        const guests = Number(fields.guests.value);
        const roomPrice = roomPrices[fields.room.value] || 0;
        const service = fields.service.value;
        const serviceTotal =
            service === 'transfer'
                ? 35
                : service === 'car'
                  ? 55 * validNights
                  : service === 'tour'
                    ? 45 * guests
                    : 0;
        return {
            nights: validNights,
            guests,
            roomPrice,
            room: fields.room.value,
            service,
            serviceTotal,
            total: roomPrice * validNights + serviceTotal
        };
    }

    function renderDefinitionList(target, entries) {
        target.replaceChildren();
        entries.forEach(([label, value]) => {
            const term = document.createElement('dt');
            const description = document.createElement('dd');
            term.textContent = label;
            description.textContent = value;
            target.append(term, description);
        });
    }

    function bookingUrl() {
        return App.url('booking.html', {
            hotel: hotel.id,
            checkin: fields.checkin.value,
            checkout: fields.checkout.value,
            guests: fields.guests.value,
            room: fields.room.value,
            service: fields.service.value
        });
    }

    function renderAccount() {
        const activeUser = App.getUser();
        if (activeUser) {
            account.innerHTML =
                '<p class="small muted">Saving this trip to <strong>' +
                App.escape(activeUser.name) +
                '’s</strong> profile.</p>';
        } else {
            const nextUrl = bookingUrl();
            account.innerHTML =
                '<p><strong>Log in to save this booking</strong></p><p class="muted">Log in or create a demo account to save this booking to your profile. Your selections will be kept.</p><div class="inline"><a data-booking-auth href="' +
                App.escape(App.url('login.html', { next: nextUrl })) +
                '" class="button button-secondary">Log in</a><a data-booking-auth href="' +
                App.escape(App.url('signup.html', { next: nextUrl })) +
                '" class="button button-ghost">Create account</a></div>';
        }
    }

    function updateSummary() {
        const plan = selection();
        document.getElementById('booking-back-to-hotel').href = App.url('hotel-detail.html', {
            hotel: hotel.id,
            checkin: fields.checkin.value,
            checkout: fields.checkout.value,
            guests: fields.guests.value,
            room: fields.room.value,
            service: fields.service.value
        });
        renderDefinitionList(document.getElementById('booking-cost'), [
            [roomNames[plan.room] || 'Choose a room', App.money(plan.roomPrice) + ' / night'],
            [
                'Length of stay',
                plan.nights
                    ? plan.nights + (plan.nights === 1 ? ' night' : ' nights')
                    : 'Choose dates'
            ],
            ['Guests', String(plan.guests || 'Choose guests')],
            [serviceNames[plan.service] || 'Extra service', App.money(plan.serviceTotal)],
            ['Estimated total', plan.nights ? App.money(plan.total) : 'Choose dates']
        ]);
        if (currentStep === 2) {
            renderDefinitionList(document.getElementById('booking-review'), [
                ['Stay', hotel.name],
                ['Dates', fields.checkin.value + ' to ' + fields.checkout.value],
                ['Room', roomNames[plan.room]],
                ['Guests', String(plan.guests)],
                ['Guest name', fields.fullname.value.trim()],
                ['Email', fields.email.value.trim()],
                ['Phone', fields.phone.value.trim()],
                ['Extra', serviceNames[plan.service]],
                ['Requests', fields.notes.value.trim() || 'None'],
                ['Total', App.money(plan.total)]
            ]);
            renderAccount();
        }
    }

    function fieldErrors(step) {
        const errors = {};
        if (step === 0) {
            Object.assign(errors, App.dateErrors(fields.checkin.value, fields.checkout.value));
            const guests = Number(fields.guests.value);
            if (!Number.isInteger(guests) || guests < 1 || guests > 6)
                errors.guests = 'Choose between 1 and 6 guests.';
            if (!Object.hasOwn(roomPrices, fields.room.value))
                errors.room = 'Choose an available room type.';
            if (!Object.hasOwn(serviceNames, fields.service.value))
                errors.service = 'Choose a service or select “Just the stay”.';
        } else if (step === 1) {
            const name = fields.fullname.value.trim();
            if (name.length < 2 || name.length > 100)
                errors.fullname = 'Enter a name between 2 and 100 characters.';
            const emailError = App.emailError(fields.email.value.trim());
            const phoneError = App.phoneError(fields.phone.value.trim());
            if (emailError) errors.email = emailError;
            if (phoneError) errors.phone = phoneError;
            if (fields.notes.value.trim().length > 1000)
                errors.notes = 'Keep your request under 1,000 characters.';
        } else if (!fields.terms.checked) {
            errors.terms = 'Confirm that you understand this is a demo booking.';
        }
        return errors;
    }

    function showStep(index, focus = true) {
        currentStep = index;
        steps.forEach((step, i) => {
            step.hidden = i !== index;
        });
        progress.forEach((item, i) => {
            item.classList.toggle('is-complete', i < index);
            if (i === index) item.setAttribute('aria-current', 'step');
            else item.removeAttribute('aria-current');
        });
        back.hidden = index === 0;
        next.hidden = index === 2;
        confirm.hidden = index !== 2;
        status.textContent = '';
        updateSummary();
        if (focus) steps[index].querySelector('legend').focus();
    }

    function validateStep(index) {
        const errors = fieldErrors(index);
        if (Object.keys(errors).length) {
            showStep(index, false);
            App.errors(form, errors);
            status.textContent = 'Check the highlighted fields.';
            status.classList.add('error');
            return false;
        }
        App.errors(form, {});
        status.classList.remove('error');
        return true;
    }

    function saveDraft() {
        App.write('bookingDraft', {
            hotelId: hotel.id,
            userId: App.getUser()?.id || null,
            checkin: fields.checkin.value,
            checkout: fields.checkout.value,
            guests: fields.guests.value,
            room: fields.room.value,
            service: fields.service.value,
            name: fields.fullname.value.trim(),
            email: fields.email.value.trim(),
            phone: fields.phone.value.trim(),
            notes: fields.notes.value.trim()
        });
        App.write('pendingBookingUrl', bookingUrl());
    }

    next.addEventListener('click', () => {
        if (validateStep(currentStep)) showStep(currentStep + 1);
    });
    back.addEventListener('click', () => {
        App.errors(form, {});
        showStep(currentStep - 1);
    });
    form.addEventListener('input', updateSummary);
    form.addEventListener('change', updateSummary);
    account.addEventListener('click', (event) => {
        if (!event.target.closest('[data-booking-auth]')) return;
        try {
            saveDraft();
        } catch (error) {
            event.preventDefault();
            status.textContent = error.message;
            status.focus();
        }
    });

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        if (submitted) return;
        if (currentStep < 2) {
            if (validateStep(currentStep)) showStep(currentStep + 1);
            return;
        }
        // Recheck all steps so changed dates and stale form state cannot bypass validation.
        for (let index = 0; index < steps.length; index++) {
            if (!validateStep(index)) return;
        }
        const activeUser = App.getUser();
        if (!activeUser) {
            renderAccount();
            status.textContent = 'Log in or create an account above to save your demo booking.';
            status.classList.add('error');
            account.querySelector('a').focus();
            return;
        }
        confirm.disabled = true;
        confirm.textContent = 'Saving demo booking…';
        try {
            const plan = selection();
            const id =
                'BK-' +
                (crypto.randomUUID
                    ? crypto.randomUUID().slice(0, 8).toUpperCase()
                    : Date.now().toString(36).toUpperCase());
            const record = {
                id,
                userId: activeUser.id,
                hotelId: hotel.id,
                hotelName: hotel.name,
                name: fields.fullname.value.trim(),
                email: fields.email.value.trim(),
                phone: fields.phone.value.trim(),
                checkin: fields.checkin.value,
                checkout: fields.checkout.value,
                guests: plan.guests,
                room: plan.room,
                roomPrice: plan.roomPrice,
                service: plan.service,
                serviceTotal: plan.serviceTotal,
                nights: plan.nights,
                total: plan.total,
                notes: fields.notes.value.trim(),
                createdAt: new Date().toISOString(),
                status: 'confirmed'
            };
            const saved = App.read('bookings', []);
            const records = Array.isArray(saved) ? saved : [];
            App.write('bookings', [...records, record]);
            submitted = true;
            // Cleanup is best-effort after the booking has been saved successfully.
            try {
                App.remove('bookingDraft');
                App.remove('pendingBookingUrl');
            } catch (_) {
                /* Saved booking remains valid. */
            }
            form.hidden = true;
            document.querySelector('.step-list').hidden = true;
            document.getElementById('booking-success-details').textContent =
                hotel.name +
                ' · ' +
                record.nights +
                (record.nights === 1 ? ' night' : ' nights') +
                ' · ' +
                App.money(record.total) +
                ' · Reference ' +
                id;
            const success = document.getElementById('booking-success');
            success.hidden = false;
            success.focus();
            App.notify('Your demo booking is saved in your profile.');
        } catch (error) {
            status.textContent = error.message || 'Unable to save the booking. Try again.';
            status.classList.add('error');
            status.focus();
            confirm.disabled = false;
            confirm.textContent = 'Save demo booking';
        }
    });

    window.addEventListener('storage', () => {
        if (!submitted) renderAccount();
    });
    showStep(0, false);
})();
