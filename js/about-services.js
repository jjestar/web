/* About and Services page behavior. All data belongs to this browser-only demo. */
(() => {
    'use strict';

    const services = {
        transfer: { name: 'Airport transfer', price: 35, unit: 'arrival transfer' },
        car: { name: 'Car rental', price: 55, unit: 'day' },
        tour: { name: 'Guided city tour', price: 45, unit: 'person' }
    };

    function initializeContact() {
        const form = document.getElementById('contact-form');
        if (!form) return;

        const fields = {
            name: document.getElementById('contact-name'),
            email: document.getElementById('contact-email'),
            subject: document.getElementById('contact-subject'),
            reply: document.getElementById('contact-reply'),
            phone: document.getElementById('contact-phone'),
            message: document.getElementById('contact-message')
        };
        const phoneField = document.getElementById('contact-phone-field');
        const status = document.getElementById('contact-status');
        const download = document.getElementById('contact-download');
        let savedDraft = null;

        function updatePhoneField() {
            phoneField.hidden = fields.reply.value !== 'phone';
            fields.phone.disabled = phoneField.hidden;
            if (phoneField.hidden) {
                document.getElementById('contact-phone-error').textContent = '';
                fields.phone.removeAttribute('aria-invalid');
            }
        }

        function readValues() {
            return Object.fromEntries(
                Object.entries(fields).map(([key, field]) => [key, field.value.trim()])
            );
        }

        function validate(values) {
            const errors = {};
            if (values.name.length < 2 || values.name.length > 80) {
                errors['contact-name'] = 'Enter your name using 2–80 characters.';
            }
            const emailError = App.emailError(values.email);
            if (emailError) errors['contact-email'] = emailError;
            if (!['general', 'booking', 'feedback'].includes(values.subject)) {
                errors['contact-subject'] = 'Choose a topic for your message.';
            }
            if (!['email', 'phone'].includes(values.reply)) {
                errors['contact-reply'] = 'Choose email or phone for your draft.';
            }
            if (values.reply === 'phone') {
                const phoneError = App.phoneError(values.phone);
                if (phoneError) errors['contact-phone'] = phoneError;
            }
            if (values.message.length < 10 || values.message.length > 2000) {
                errors['contact-message'] = 'Write a message between 10 and 2,000 characters.';
            }
            return App.errors(form, errors);
        }

        function setStatus(message, isError = false) {
            status.textContent = message;
            status.classList.toggle('is-error', isError);
        }

        const previous = App.read('contactDraft', null);
        if (previous && typeof previous === 'object' && typeof previous.message === 'string') {
            for (const [key, field] of Object.entries(fields)) {
                if (typeof previous[key] === 'string') field.value = previous[key];
            }
            savedDraft = previous;
            download.hidden = false;
            setStatus('Saved draft restored. No message was sent.');
        }
        updatePhoneField();

        fields.reply.addEventListener('change', updatePhoneField);
        form.addEventListener('input', () => {
            setStatus('');
            download.hidden = true;
        });
        form.addEventListener('change', () => {
            setStatus('');
            download.hidden = true;
        });

        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const values = readValues();
            if (validate(values)) {
                setStatus('Check the highlighted fields, then save your message again.', true);
                return;
            }
            const draft = {
                ...values,
                phone: values.reply === 'phone' ? values.phone : '',
                savedAt: new Date().toISOString()
            };
            try {
                App.write('contactDraft', draft);
                savedDraft = draft;
                download.hidden = false;
                setStatus(
                    'Your demo message is saved in this browser. No message, email, or phone request was sent.'
                );
                status.focus();
            } catch (error) {
                setStatus(
                    error.message ||
                        'Your draft could not be saved. Check browser storage and try again.',
                    true
                );
            }
        });

        document.getElementById('contact-clear').addEventListener('click', () => {
            try {
                App.remove('contactDraft');
                form.reset();
                App.errors(form, {});
                savedDraft = null;
                download.hidden = true;
                updatePhoneField();
                setStatus('Your draft has been cleared from this browser.');
                fields.name.focus();
            } catch (error) {
                setStatus(error.message || 'Unable to clear the saved draft. Try again.', true);
            }
        });

        download.addEventListener('click', () => {
            if (!savedDraft) return;
            const text = [
                'BookingApp — saved demo message',
                'This message was saved locally. It was not sent.',
                '',
                `Name: ${savedDraft.name}`,
                `Email: ${savedDraft.email}`,
                `Topic: ${savedDraft.subject}`,
                `Preferred reply method: ${savedDraft.reply}`,
                ...(savedDraft.reply === 'phone' ? [`Phone: ${savedDraft.phone}`] : []),
                '',
                savedDraft.message
            ].join('\r\n');
            const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
            const link = document.createElement('a');
            link.href = url;
            link.download = 'BookingApp-demo-message.txt';
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.setTimeout(() => URL.revokeObjectURL(url), 1000);
            setStatus('Your saved copy is ready to download. No message has been sent.');
        });
    }

    function initializeServices() {
        const form = document.getElementById('service-estimate-form');
        if (!form) return;

        const choice = document.getElementById('service-choice');
        const quantity = document.getElementById('service-quantity');
        const quantityField = document.getElementById('service-quantity-field');
        const status = document.getElementById('service-estimate-status');
        const result = document.getElementById('service-estimate-result');
        const empty = document.getElementById('estimate-empty');
        const query = new URLSearchParams(window.location.search);
        const selectedHotel = window.hotelsDatabase?.find(
            (hotel) => String(hotel.id) === query.get('hotel')
        );

        function bookingUrl(service) {
            return App.url('booking.html', { hotel: selectedHotel?.id || '', service });
        }

        document.querySelectorAll('[data-service-booking]').forEach((link) => {
            link.href = bookingUrl(link.dataset.serviceBooking);
        });

        function hideEstimate() {
            result.hidden = true;
            empty.hidden = false;
            status.textContent = '';
            status.classList.remove('is-error');
        }

        function updateServiceDetails() {
            const service = services[choice.value];
            quantityField.hidden = choice.value === 'transfer';
            quantity.disabled = quantityField.hidden;
            document.getElementById('quantity-label').textContent =
                choice.value === 'tour' ? 'Number of people' : 'Number of days';
            document.getElementById('service-rate').textContent = service
                ? choice.value === 'transfer'
                    ? `${App.money(service.price)} for one arrival transfer. This is a flat fee.`
                    : `${App.money(service.price)} per ${service.unit}. Hotel accommodation is priced separately.`
                : 'Choose a service to see its price.';
            App.errors(form, {});
            hideEstimate();
        }

        function calculate() {
            const errors = {};
            const service = services[choice.value];
            const count = choice.value === 'transfer' ? 1 : Number(quantity.value.trim());
            if (!service) errors['service-choice'] = 'Choose one of the available travel services.';
            if (
                choice.value !== 'transfer' &&
                (!/^\d+$/.test(quantity.value.trim()) ||
                    !Number.isInteger(count) ||
                    count < 1 ||
                    count > 30)
            ) {
                errors['service-quantity'] = 'Enter a whole number from 1 to 30.';
            }
            if (App.errors(form, errors)) {
                hideEstimate();
                status.textContent = 'Check the highlighted field to calculate your estimate.';
                status.classList.add('is-error');
                return;
            }
            const total = service.price * count;
            document.getElementById('estimate-description').textContent =
                choice.value === 'transfer'
                    ? `${service.name} · one-time fee`
                    : `${service.name} · ${count} ${choice.value === 'tour' ? (count === 1 ? 'person' : 'people') : count === 1 ? 'day' : 'days'} × ${App.money(service.price)}`;
            document.getElementById('estimate-total').textContent = App.money(total);
            document.getElementById('estimate-continue').href = bookingUrl(choice.value);
            empty.hidden = true;
            result.hidden = false;
            status.classList.remove('is-error');
            status.textContent = 'Estimate calculated. No service has been booked.';
            try {
                App.write('serviceEstimate', { service: choice.value, quantity: count, total });
            } catch (error) {
                status.textContent =
                    'Estimate calculated. Browser storage is unavailable, so this estimate will not be remembered.';
            }
        }

        const previous = App.read('serviceEstimate', null);
        if (previous && services[previous.service]) {
            choice.value = previous.service;
            if (
                Number.isInteger(previous.quantity) &&
                previous.quantity >= 1 &&
                previous.quantity <= 30
            ) {
                quantity.value = String(previous.quantity);
            }
        }
        if (services[query.get('service')]) choice.value = query.get('service');
        updateServiceDetails();

        choice.addEventListener('change', updateServiceDetails);
        quantity.addEventListener('input', hideEstimate);
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            calculate();
        });
    }

    function initialize() {
        initializeContact();
        initializeServices();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
})();
