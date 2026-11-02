function showNotification(message, type = 'success') {
    let notification = $('#notification');

    if (notification.length === 0) {
        notification = $('<div>', {
            id: 'notification',
            class: 'app-notification',
            role: 'status',
            'aria-live': 'polite',
            'aria-atomic': 'true'
        }).appendTo('body');
    }

    notification.stop(true, true);
    notification.toggleClass('notification-error', type === 'error');
    notification.text(message);
    notification.fadeIn(180).delay(2600).fadeOut(350);
}

function loadVisibleImages() {
    const windowTop = $(window).scrollTop();
    const windowBottom = windowTop + $(window).height();

    $('img[data-src]').each(function () {
        const image = $(this);

        if (!image.is(':visible')) {
            return;
        }

        const imageTop = image.offset().top;
        const imageBottom = imageTop + image.outerHeight();

        if (imageTop < windowBottom && imageBottom > windowTop) {
            const imagePath = image.attr('data-src');

            image.one('load', function () {
                image.addClass('image-loaded');
            });

            image.one('error', function () {
                image.attr('src', 'image/placeholder.svg');
                image.attr('alt', image.attr('alt') + ' - image unavailable');
            });

            image.removeAttr('data-src');
            image.attr('src', imagePath);
        }
    });
}

async function copyTextToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        try {
            await navigator.clipboard.writeText(text);
            return;
        } catch (error) {
            return copyTextWithSelection(text);
        }
    }

    return copyTextWithSelection(text);
}

function copyTextWithSelection(text) {
    const previousFocus = document.activeElement;
    const temporaryInput = $('<textarea>', {
        class: 'clipboard-input',
        'aria-label': 'Text to copy'
    }).val(text).appendTo('body');

    temporaryInput[0].focus();
    temporaryInput[0].select();
    let copied = false;

    try {
        copied = document.execCommand('copy');
    } finally {
        temporaryInput.remove();
        if (previousFocus) {
            previousFocus.focus();
        }
    }

    if (!copied) {
        throw new Error('Copy failed');
    }
}

$(document).ready(function () {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        $.fx.off = true;
    }

    $(window).on('scroll resize', loadVisibleImages);
    loadVisibleImages();

    $(document).on('click', '.copy-button', async function () {
        const button = $(this);
        const target = document.querySelector(button.attr('data-copy-target'));

        if (!target || button.prop('disabled')) {
            return;
        }

        const text = target.innerText.trim();
        const icon = button.find('.copy-icon');
        const tooltip = button.find('.copy-tooltip');

        if (!text) {
            showNotification('There is no text to copy yet.', 'error');
            return;
        }

        clearTimeout(button.data('resetTimer'));
        button.prop('disabled', true);

        try {
            await copyTextToClipboard(text);
            icon.text('✓');
            tooltip.text('Copied to clipboard!').prop('hidden', false);
            button.addClass('copy-success');
        } catch (error) {
            icon.text('⧉');
            tooltip.text('Copy failed. Please select the text.').prop('hidden', false);
            button.removeClass('copy-success');
            showNotification('Could not copy the text. Please select and copy it manually.', 'error');
        } finally {
            button.prop('disabled', false);
        }

        const resetTimer = setTimeout(function () {
            icon.text('⧉');
            tooltip.prop('hidden', true);
            button.removeClass('copy-success');
        }, 2200);

        button.data('resetTimer', resetTimer);
    });
});
