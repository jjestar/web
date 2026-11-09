/* About and Services page behavior. All data belongs to this browser-only student project. */
(() => {
    'use strict';

    const tierNames = { standard: 'Standard', premium: 'Premium', vip: 'VIP' };

    function initializeScrollProgress() {
        const $ = window.jQuery;
        if (!['about', 'services'].includes(document.body.dataset.page)) return;
        const $track = $('<div>', {
            class: 'assignment-scroll-track',
            role: 'progressbar',
            'aria-label': 'Page reading progress',
            'aria-valuemin': '0',
            'aria-valuemax': '100',
            'aria-valuenow': '0'
        })
            .append($('<div>', { class: 'assignment-scroll-fill' }))
            .prependTo('body');
        let scheduled = false;
        const update = () => {
            scheduled = false;
            const available = Math.max(0, $(document).height() - $(window).height());
            const progress = available ? Math.min(100, Math.max(0, (window.scrollY / available) * 100)) : 100;
            $track.children().css('width', progress + '%');
            $track.attr('aria-valuenow', Math.round(progress));
        };
        $(window).on('scroll.assignmentProgress resize.assignmentProgress load.assignmentProgress', () => {
            if (!scheduled) {
                scheduled = true;
                window.requestAnimationFrame(update);
            }
        });
        update();
    }

    function initializeCounters() {
        const $ = window.jQuery;
        const section = document.querySelector('.booking-stats');
        if (!section) return;
        const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
        let played = false;
        const animations = [];
        const reveal = () => {
            if (played) return;
            played = true;
            $('.stat-number', section).each(function () {
                const output = this;
                const target = Number(output.dataset.count);
                if (motion.matches) {
                    output.textContent = String(target);
                    return;
                }
                const animation = $({ value: 0 });
                animations.push(animation);
                animation.animate(
                    { value: target },
                    {
                        duration: 1400,
                        easing: 'swing',
                        step(value) {
                            output.textContent = String(Math.floor(value));
                        },
                        complete() {
                            output.textContent = String(target);
                        }
                    }
                );
            });
        };
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver(
                (entries) => {
                    if (entries.some((entry) => entry.isIntersecting)) {
                        reveal();
                        observer.disconnect();
                    }
                },
                { threshold: 0.25 }
            );
            observer.observe(section);
        } else reveal();
        motion.addEventListener('change', () => {
            if (motion.matches) {
                animations.forEach((animation) => animation.stop(true, true));
                $('.stat-number', section).each(function () {
                    this.textContent = this.dataset.count;
                });
            }
        });
    }

    // Capture validated values before the demonstration delay. Reset cancels the
    // pending completion, so an old submission cannot overwrite a cleared form.
    function attachSubmitSpinner(form, readValues, complete) {
        const $ = window.jQuery;
        const button = form.querySelector('button[type="submit"]');
        const label = button.innerHTML;
        let pending = null;
        let lockedFields = [];
        function restore() {
            button.innerHTML = label;
            button.disabled = false;
            form.setAttribute('aria-busy', 'false');
            lockedFields.forEach(([field, wasDisabled]) => {
                field.disabled = wasDisabled;
            });
            lockedFields = [];
        }
        function cancel() {
            if (pending !== null) window.clearTimeout(pending);
            pending = null;
            restore();
        }
        $(form).on('submit.assignmentSubmit', (event) => {
            event.preventDefault();
            if (pending !== null || button.disabled) return;
            const values = readValues();
            if (!values) return;
            const captured = Object.freeze({ ...values });
            button.innerHTML =
                '<span class="assignment-submit-spinner" aria-hidden="true"></span>Please wait…';
            button.disabled = true;
            form.setAttribute('aria-busy', 'true');
            lockedFields = [...form.querySelectorAll('input,select,textarea')].map((field) => [
                field,
                field.disabled
            ]);
            lockedFields.forEach(([field]) => {
                field.disabled = true;
            });
            pending = window.setTimeout(() => {
                pending = null;
                restore();
                complete(captured);
            }, 1200);
        });
        $(form).on('reset.assignmentSubmit', cancel);
        return { cancel };
    }

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

        attachSubmitSpinner(
            form,
            () => {
                const values = readValues();
                if (validate(values)) {
                    setStatus('Check the highlighted fields, then save your message again.', true);
                    return null;
                }
                download.hidden = true;
                setStatus('Saving your message in this browser…');
                return {
                    ...values,
                    phone: values.reply === 'phone' ? values.phone : ''
                };
            },
            (values) => {
                const draft = { ...values, savedAt: new Date().toISOString() };
                try {
                    App.write('contactDraft', draft);
                    savedDraft = draft;
                    download.hidden = false;
                    setStatus(
                        'Your message is saved in this browser. No message, email, or phone request was sent.'
                    );
                    status.focus();
                } catch (error) {
                    setStatus(
                        error.message ||
                            'Your draft could not be saved. Check browser storage and try again.',
                        true
                    );
                }
            }
        );
        window.jQuery(form).on('reset.contactDraft', () => {
            App.errors(form, {});
            download.hidden = true;
            setStatus('');
            window.setTimeout(updatePhoneField, 0);
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
                'BookingApp — saved message',
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
            link.download = 'BookingApp-contact-message.txt';
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
        const $ = window.jQuery;
        const services = window.travelServices;
        const choice = document.getElementById('service-choice');
        const tier = document.getElementById('service-tier');
        const quantity = document.getElementById('service-quantity');
        const quantityField = document.getElementById('service-quantity-field');
        const status = document.getElementById('service-estimate-status');
        const result = document.getElementById('service-estimate-result');
        const empty = document.getElementById('estimate-empty');
        const query = new URLSearchParams(window.location.search);
        const selectedHotel = window.hotelsDatabase?.find((hotel) => String(hotel.id) === query.get('hotel'));
        const hasService = (id) => services && Object.hasOwn(services, id);
        const hasTier = (value) => Object.hasOwn(tierNames, value);
        if (!services) {
            status.textContent = 'Service prices could not be loaded. Reload the page and try again.';
            status.classList.add('is-error');
            form.querySelector('button[type="submit"]').disabled = true;
            return;
        }

        function bookingUrl(service, serviceTier = 'standard', serviceQuantity = 1) {
            const params = {
                hotel: selectedHotel?.id || '',
                service,
                serviceTier,
                serviceQuantity
            };
            ['checkin', 'checkout', 'guests', 'room'].forEach((key) => {
                if (query.has(key)) params[key] = query.get(key);
            });
            return App.url('booking.html', params);
        }
        $('[data-service-booking]').each(function () {
            this.href = bookingUrl(this.dataset.serviceBooking);
        });
        $('[data-service-rate]').each(function () {
            const service = services[this.dataset.serviceRate];
            const value = service?.rates[this.dataset.tier];
            if (Number.isFinite(value)) this.textContent = value === 0 ? 'Included' : App.money(value);
        });

        function hideEstimate() {
            result.hidden = true;
            empty.hidden = false;
            status.textContent = '';
            status.classList.remove('is-error');
        }
        function perParty(service, serviceTier) {
            return service === 'tour' && serviceTier !== 'standard';
        }
        function updateServiceDetails() {
            const service = hasService(choice.value) ? services[choice.value] : null;
            const serviceTier = tier.value;
            const party = perParty(choice.value, serviceTier);
            quantityField.hidden = party;
            quantity.disabled = party;
            if (party) quantity.value = '1';
            document.getElementById('quantity-label').textContent =
                choice.value === 'transfer'
                    ? serviceTier === 'premium'
                        ? 'Number of round trips'
                        : 'Number of trips'
                    : choice.value === 'tour'
                      ? 'Number of people'
                      : 'Number of days';
            let rateText = 'Choose a service and pricing level.';
            if (service && hasTier(serviceTier)) {
                const rate = App.money(service.rates[serviceTier]);
                if (choice.value === 'transfer') {
                    rateText =
                        serviceTier === 'vip'
                            ? 'VIP transfer is included ($0). Choose the number of trips for your itinerary.'
                            : `${tierNames[serviceTier]} transfer: ${rate} per ${serviceTier === 'premium' ? 'round trip' : 'one-way trip'}.`;
                } else if (choice.value === 'tour') {
                    rateText =
                        serviceTier === 'standard'
                            ? `Standard group tour: ${rate} per person.`
                            : `${tierNames[serviceTier]} ${serviceTier === 'premium' ? 'private guide' : 'special tour'}: ${rate} for one party. Guest count does not multiply this price.`;
                } else rateText = `${tierNames[serviceTier]} car rental: ${rate} per day.`;
            }
            document.getElementById('service-rate').textContent = rateText;
            App.errors(form, {});
            hideEstimate();
        }

        function readEstimate() {
            const issues = {};
            const serviceId = choice.value;
            const serviceTier = tier.value;
            const validService = hasService(serviceId);
            const validTier = hasTier(serviceTier);
            const party = serviceId === 'tour' && validTier && perParty(serviceId, serviceTier);
            const rawCount = quantity.value.trim();
            const count = party ? 1 : Number(rawCount);
            if (!validService) issues['service-choice'] = 'Choose one of the available travel services.';
            if (!validTier) issues['service-tier'] = 'Choose Standard, Premium, or VIP.';
            if (!party && (!/^\d+$/.test(rawCount) || !Number.isInteger(count) || count < 1 || count > 30)) {
                issues['service-quantity'] = 'Enter a whole number from 1 to 30.';
            }
            if (App.errors(form, issues)) {
                hideEstimate();
                status.textContent = 'Check the highlighted fields to calculate your estimate.';
                status.classList.add('is-error');
                return null;
            }
            const service = services[serviceId];
            const price = service.rates[serviceTier];
            hideEstimate();
            status.textContent = 'Calculating your service estimate…';
            return {
                service: serviceId,
                name: service.name,
                serviceTier,
                serviceQuantity: count,
                price,
                total: price * count
            };
        }

        function showEstimate(estimate) {
            let unit =
                estimate.service === 'car'
                    ? estimate.serviceQuantity === 1
                        ? 'day'
                        : 'days'
                    : estimate.service === 'tour'
                      ? estimate.serviceQuantity === 1
                          ? 'person'
                          : 'people'
                      : estimate.serviceTier === 'premium'
                        ? estimate.serviceQuantity === 1
                            ? 'round trip'
                            : 'round trips'
                        : estimate.serviceQuantity === 1
                          ? 'trip'
                          : 'trips';
            if (perParty(estimate.service, estimate.serviceTier)) unit = 'party';
            document.getElementById('estimate-description').textContent =
                `${estimate.name} · ${tierNames[estimate.serviceTier]} · ${estimate.serviceQuantity} ${unit} × ${App.money(estimate.price)}`;
            document.getElementById('estimate-total').textContent =
                estimate.price === 0 ? 'Included · $0' : App.money(estimate.total);
            document.getElementById('estimate-continue').href = bookingUrl(
                estimate.service,
                estimate.serviceTier,
                estimate.serviceQuantity
            );
            empty.hidden = true;
            result.hidden = false;
            status.classList.remove('is-error');
            status.textContent = 'Estimate calculated. No service has been booked.';
            if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                $(result).stop(true, true).css('opacity', 0).animate({ opacity: 1 }, 200);
            }
            try {
                App.write('serviceEstimate', {
                    service: estimate.service,
                    serviceTier: estimate.serviceTier,
                    serviceQuantity: estimate.serviceQuantity,
                    tier: estimate.serviceTier,
                    quantity: estimate.serviceQuantity,
                    total: estimate.total
                });
            } catch (error) {
                status.textContent =
                    'Estimate calculated. Browser storage is unavailable, so this estimate will not be remembered.';
            }
        }

        const previous = App.read('serviceEstimate', null);
        if (previous && typeof previous === 'object' && hasService(previous.service)) {
            choice.value = previous.service;
            const savedTier = previous.serviceTier || previous.tier;
            if (hasTier(savedTier)) tier.value = savedTier;
            const savedQuantity = previous.serviceQuantity ?? previous.quantity;
            if (Number.isInteger(savedQuantity) && savedQuantity >= 1 && savedQuantity <= 30)
                quantity.value = String(savedQuantity);
        }
        if (hasService(query.get('service'))) choice.value = query.get('service');
        if (hasTier(query.get('serviceTier'))) tier.value = query.get('serviceTier');
        if (/^\d+$/.test(query.get('serviceQuantity') || '')) {
            const requested = Number(query.get('serviceQuantity'));
            if (requested >= 1 && requested <= 30) quantity.value = String(requested);
        }
        updateServiceDetails();
        $(choice).add(tier).on('change.serviceEstimate', updateServiceDetails);
        $(quantity).on('input.serviceEstimate', hideEstimate);
        attachSubmitSpinner(form, readEstimate, showEstimate);
        $(form).on('reset.serviceEstimate', () => {
            hideEstimate();
            App.errors(form, {});
            App.remove('serviceEstimate');
            window.setTimeout(() => {
                updateServiceDetails();
                status.textContent = 'Estimate cleared. Choose a service to start again.';
            }, 0);
        });
    }

    function initialize() {
        if (!window.jQuery) {
            document.querySelectorAll('#contact-status, #service-estimate-status').forEach((output) => {
                output.textContent = 'Interactive features could not load. Reload the page and try again.';
                output.classList.add('is-error');
            });
            return;
        }
        initializeScrollProgress();
        initializeCounters();
        initializeContact();
        initializeServices();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
})();
