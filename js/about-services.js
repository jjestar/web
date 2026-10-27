
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
        const service = serviceEstimator.getService(serviceChoice.value);
        quantityLabel.textContent = service.quantityLabel;
        serviceRate.textContent = 'Standard price: $' + service.price + ' per ' + service.unit + '.';
        estimateResult.hidden = true;
    }

    serviceChoice.addEventListener('change', updateServiceDetails);
    quantityInput.addEventListener('input', function () {
        estimateResult.hidden = true;
    });

    estimateForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const quantity = Number(quantityInput.value);
        const service = serviceEstimator.getService(serviceChoice.value);
        const total = serviceEstimator.calculateTotal(serviceChoice.value, quantity);

        estimateDescription.textContent = service.name + ': ' + quantity + ' × $' + service.price;
        estimateTotal.textContent = 'Estimated total: $' + total.toFixed(2);
        estimateResult.hidden = false;
        estimateResult.classList.add('estimate-reveal');
    });

    estimateResult.addEventListener('animationend', function () {
        estimateResult.classList.remove('estimate-reveal');
    });

    updateServiceDetails();
}

const contactForm = document.getElementById('contact-form');

if (contactForm) {
    const contactStatus = document.getElementById('contact-status');
    const contactFields = contactForm.querySelectorAll('[required]');

    contactForm.addEventListener('submit', function (event) {
        event.preventDefault();
        contactStatus.textContent = '';

        contactFields.forEach(function (field) {
            const isEmpty = field.value.trim() === '';
            field.setCustomValidity(isEmpty ? 'Please complete this field.' : '');
        });

        if (!contactForm.reportValidity()) {
            return;
        }

        const name = document.getElementById('contact-name').value.trim();
        contactStatus.textContent = 'Thank you, ' + name + '! Your message is ready. This is a demo; no message or email was sent.';
        contactStatus.focus();
    });

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
