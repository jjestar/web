/* Shared interactions retained from Assignments 5 and 6. No server is used. */
(() => {
    'use strict';
    const $ = window.jQuery;
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    const imageFallback = new URL('image/placeholder.svg', document.baseURI).href;

    // Capture image failures, including lazy images and newly rendered search results.
    function replaceFailedImage(image) {
        if (!(image instanceof HTMLImageElement) || image.dataset.imageFallback === 'true') return;
        image.dataset.imageFallback = 'true';
        image.removeAttribute('srcset');
        image.removeAttribute('data-src');
        image.alt = (image.alt || 'Travel photograph') + ' — image unavailable';
        image.src = imageFallback;
    }
    document.addEventListener('error', (event) => replaceFailedImage(event.target), true);

    // Assignment 6 lazy loading: only replace the placeholder when a photo is visible.
    // This also covers dynamically inserted result rows and carousel slides.
    function loadVisibleImages() {
        const top = $(window).scrollTop();
        const bottom = top + $(window).height();
        $('img[data-src]').each(function () {
            const image = $(this);
            if (!image.is(':visible') || this.closest('[hidden], [inert]')) return;
            const imageTop = image.offset().top;
            if (imageTop >= bottom || imageTop + image.outerHeight() <= top) return;
            image.one('load', () => image.addClass('image-loaded'));
            image.one('error', () => replaceFailedImage(this));
            const src = image.attr('data-src');
            image.removeAttr('data-src').attr('src', src);
        });
    }
    window.loadVisibleImages = loadVisibleImages;

    async function copyText(text) {
        if (navigator.clipboard && window.isSecureContext) {
            try {
                await navigator.clipboard.writeText(text);
                return;
            } catch {
                /* Fall back to selection when clipboard permissions are unavailable. */
            }
        }
        const previous = document.activeElement;
        const input = document.createElement('textarea');
        input.className = 'clipboard-input';
        input.value = text;
        input.setAttribute('aria-label', 'Text to copy');
        document.body.append(input);
        input.focus();
        input.select();
        let success;
        try {
            success = document.execCommand('copy');
        } finally {
            input.remove();
            previous?.focus();
        }
        if (!success) throw new Error('Copy failed. Select the text and copy it manually.');
    }
    window.copyTextToClipboard = copyText;

    $(function () {
        console.info('jQuery is ready!');
        $.fx.off = reducedMotion.matches;
        reducedMotion.addEventListener('change', (event) => {
            $.fx.off = event.matches;
        });
        let imageFrame = null;
        function scheduleImages() {
            if (imageFrame !== null) return;
            imageFrame = requestAnimationFrame(() => {
                imageFrame = null;
                loadVisibleImages();
            });
        }
        $(window).on('scroll.assignmentImages resize.assignmentImages', scheduleImages);
        document.addEventListener('slid.bs.carousel', scheduleImages);
        new MutationObserver((mutations) => {
            if (
                mutations.some((mutation) =>
                    [...mutation.addedNodes].some(
                        (node) =>
                            node.nodeType === 1 &&
                            (node.matches('img[data-src]') || node.querySelector('img[data-src]'))
                    )
                )
            )
                scheduleImages();
        }).observe(document.body, { childList: true, subtree: true });
        loadVisibleImages();

        const bar = document.createElement('div');
        bar.className = 'utility-bar container';
        bar.innerHTML =
            '<div class="live-clock"><span>Local time</span> <time id="current-date-time" aria-live="off"></time></div>';
        document.querySelector('.site-header')?.after(bar);
        const clock = document.getElementById('current-date-time');
        const clockFormat = new Intl.DateTimeFormat('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
        function updateClock() {
            const now = new Date();
            clock.textContent = clockFormat.format(now);
            clock.dateTime = now.toISOString();
        }
        updateClock();
        setInterval(updateClock, 1000);

        $('.main-nav').on('keydown', 'a', function (event) {
            const links = [...this.closest('nav').querySelectorAll('a')];
            const index = links.indexOf(this);
            const next = {
                ArrowRight: (index + 1) % links.length,
                ArrowDown: (index + 1) % links.length,
                ArrowLeft: (index + links.length - 1) % links.length,
                ArrowUp: (index + links.length - 1) % links.length,
                Home: 0,
                End: links.length - 1
            }[event.key];
            if (next === undefined) return;
            event.preventDefault();
            links[next].focus();
        });

        $(document).on('click', '[data-copy-target]', async function () {
            const button = this;
            const target = document.querySelector(button.dataset.copyTarget);
            const text = target?.innerText.trim();
            if (!text) {
                App.notify('There is no text to copy yet.', 'error');
                return;
            }
            if (button.dataset.copyBusy) return;
            const original = button.dataset.copyLabel || button.textContent.trim();
            button.dataset.copyLabel = original;
            clearTimeout(button.copyTimer);
            button.dataset.copyBusy = 'true';
            button.setAttribute('aria-busy', 'true');
            try {
                await copyText(text);
                button.innerHTML =
                    App.icon('check') +
                    '<span>' +
                    App.escape(original) +
                    '</span><span class="copy-tooltip" role="status">Copied to clipboard!</span>';
                button.classList.add('copy-success');
                App.notify('Copied to clipboard.');
            } catch (error) {
                App.notify(error.message, 'error');
            } finally {
                delete button.dataset.copyBusy;
                button.removeAttribute('aria-busy');
                button.copyTimer = setTimeout(() => {
                    button.innerHTML = App.icon('copy') + '<span>' + App.escape(original) + '</span>';
                    button.classList.remove('copy-success');
                }, 2200);
            }
        });
        document.querySelectorAll('img').forEach((image) => {
            if (image.complete && image.naturalWidth === 0 && image.getAttribute('src'))
                replaceFailedImage(image);
        });
    });
})();
