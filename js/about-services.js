
const clock = document.getElementById('current-date-time');

function updateDateTime() {
    const now = new Date();
    clock.textContent = now.toLocaleString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });
    clock.dateTime = now.toISOString();
}

if (clock) {
    updateDateTime();
    setInterval(updateDateTime, 1000);
}

const faqButtons = document.querySelectorAll('.service-faq-question');

faqButtons.forEach(function (button) {
    button.addEventListener('click', function () {
        const answer = document.getElementById(button.getAttribute('aria-controls'));
        const isOpen = button.getAttribute('aria-expanded') === 'true';

        button.setAttribute('aria-expanded', String(!isOpen));
        answer.setAttribute('aria-hidden', String(isOpen));
        answer.style.maxHeight = isOpen ? '0px' : answer.scrollHeight + 'px';
        button.querySelector('.faq-symbol').textContent = isOpen ? '+' : '\u2212';
    });
});

window.addEventListener('resize', function () {
    faqButtons.forEach(function (button) {
        if (button.getAttribute('aria-expanded') === 'true') {
            const answer = document.getElementById(button.getAttribute('aria-controls'));
            answer.style.maxHeight = answer.scrollHeight + 'px';
        }
    });
});

const services = [
    { id: 'transfer', name: 'Airport transfer', price: 25, unit: 'trip', quantityLabel: 'Number of trips' },
    { id: 'rental', name: 'Car rental', price: 35, unit: 'day', quantityLabel: 'Number of days' },
    { id: 'tour', name: 'Guided group tour', price: 20, unit: 'person', quantityLabel: 'Number of people' }
];

const serviceEstimator = {
    getService(serviceId) {
        return services.find(function (service) {
            return service.id === serviceId;
        });
    },

    calculateTotal(serviceId, quantity) {
        const service = this.getService(serviceId);
        return service.price * quantity;
    }
};

const estimateForm = document.getElementById('service-estimate-form');
let readEstimateValues;
let showEstimate;

if (estimateForm) {
    const serviceChoice = document.getElementById('service-choice');
    const quantityInput = document.getElementById('service-quantity');
    const quantityLabel = document.getElementById('quantity-label');
    const serviceRate = document.getElementById('service-rate');
    const estimateResult = document.getElementById('service-estimate-result');
    const estimateDescription = document.getElementById('estimate-description');
    const estimateTotal = document.getElementById('estimate-total');

    for (let i = 0; i < services.length; i++) {
        const option = document.createElement('option');
        option.value = services[i].id;
        option.textContent = services[i].name;
        serviceChoice.appendChild(option);
    }

    function updateServiceDetails() {
        serviceChoice.setCustomValidity('');
        const service = serviceEstimator.getService(serviceChoice.value);
        quantityLabel.textContent = service.quantityLabel;
        serviceRate.textContent = 'Standard price: $' + service.price + ' per ' + service.unit + '.';
        estimateResult.hidden = true;
    }

    serviceChoice.addEventListener('change', updateServiceDetails);
    quantityInput.addEventListener('input', function () {
        quantityInput.setCustomValidity('');
        estimateResult.hidden = true;
    });

    readEstimateValues = function () {
        const quantity = Number(quantityInput.value);
        const service = serviceEstimator.getService(serviceChoice.value);
        const validQuantity = Number.isInteger(quantity) && quantity >= 1 && quantity <= 30;
        serviceChoice.setCustomValidity(service ? '' : 'Please choose a service.');
        quantityInput.setCustomValidity(validQuantity ? '' : 'Please enter a whole number from 1 to 30.');
        if (!estimateForm.reportValidity()) return null;

        return {
            serviceName: service.name,
            price: service.price,
            quantity: quantity,
            total: serviceEstimator.calculateTotal(service.id, quantity)
        };
    };

    showEstimate = function (estimate) {
        estimateDescription.textContent = estimate.serviceName + ': ' + estimate.quantity + ' × $' + estimate.price;
        estimateTotal.textContent = 'Estimated total: $' + estimate.total.toFixed(2);
        estimateResult.hidden = false;
        estimateResult.classList.add('estimate-reveal');
        showNotification('Your service estimate is ready.');
    };

    estimateResult.addEventListener('animationend', function () {
        estimateResult.classList.remove('estimate-reveal');
    });

    estimateForm.addEventListener('reset', function () {
        serviceChoice.setCustomValidity('');
        quantityInput.setCustomValidity('');
        estimateResult.hidden = true;
        setTimeout(updateServiceDetails, 0);
    });

    updateServiceDetails();
}

const contactForm = document.getElementById('contact-form');
let readContactValues;
let showContactPreview;

if (contactForm) {
    const contactStatus = document.getElementById('contact-status');
    const contactFields = contactForm.querySelectorAll('[required]');

    readContactValues = function () {
        contactStatus.textContent = '';
        contactFields.forEach(function (field) {
            const isEmpty = field.value.trim() === '';
            field.setCustomValidity(isEmpty ? 'Please complete this field.' : '');
        });
        if (!contactForm.reportValidity()) return null;
        return {
            name: document.getElementById('contact-name').value.trim(),
            email: document.getElementById('contact-email').value.trim(),
            message: document.getElementById('contact-message').value.trim()
        };
    };

    showContactPreview = function (contact) {
        contactStatus.textContent = 'Thank you, ' + contact.name + '! Your message is ready. This is a demo; no message or email was sent.';
        contactStatus.focus();
        showNotification('Your demo message is ready. No email was sent.');
    };

    contactFields.forEach(function (field) {
        field.addEventListener('input', function () {
            field.setCustomValidity('');
            contactStatus.textContent = '';
        });
    });

    contactForm.addEventListener('reset', function () {
        contactStatus.textContent = '';
        contactFields.forEach(function (field) {
            field.setCustomValidity('');
        });
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

function initializeScrollProgress() {
    const $bar = $('<div class="scroll-progress-track" role="progressbar" aria-label="Page scroll progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><div class="scroll-progress-fill"></div></div>').prependTo('body');
    $(window).on('scroll resize', function () {
        const max = $(document).height() - $(window).height();
        const percent = max > 0 ? Math.min(100, Math.max(0, window.scrollY / max * 100)) : 0;
        $bar.children().css('width', percent + '%');
        $bar.attr('aria-valuenow', Math.round(percent));
    }).trigger('scroll');
}

function initializeCounters() {
    const section = document.querySelector('.booking-stats');
    if (!section) return;
    const observer = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) return;
        const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1400;
        $('.stat-number', section).each(function () {
            const $number = $(this);
            const target = Number(this.dataset.count);
            $({ value: 0 }).animate({ value: target }, {
                duration: duration,
                step: value => $number.text(Math.floor(value)),
                complete: () => $number.text(target)
            });
        });
        observer.disconnect();
    }, { threshold: 0.25 });
    observer.observe(section);
}

function attachSubmitSpinner(form, readValues, complete) {
    if (!form) return;
    const button = form.querySelector('[type="submit"]');
    const label = button.innerHTML;
    let pendingTimeout = null;

    function restoreButton() {
        button.innerHTML = label;
        button.disabled = false;
        form.setAttribute('aria-busy', 'false');
    }

    $(form).on('submit', function (event) {
        event.preventDefault();
        if (button.disabled || pendingTimeout !== null) return;
        const values = readValues();
        if (!values) return;

        button.innerHTML = '<span class="submit-spinner" aria-hidden="true"></span>Please wait…';
        button.disabled = true;
        form.setAttribute('aria-busy', 'true');

        pendingTimeout = setTimeout(function () {
            pendingTimeout = null;
            restoreButton();
            complete(values);
        }, 1200);
    });

    $(form).on('reset', function () {
        clearTimeout(pendingTimeout);
        pendingTimeout = null;
        restoreButton();
    });
}

$(document).ready(function () {
    console.log('jQuery is ready!');
    initializeScrollProgress();
    initializeCounters();
    attachSubmitSpinner(estimateForm, readEstimateValues, showEstimate);
    attachSubmitSpinner(contactForm, readContactValues, showContactPreview);
});
