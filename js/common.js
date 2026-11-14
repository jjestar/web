(() => {
    'use strict';
    const prefix = 'bookingapp.';
    const paths = {
        arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
        search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/>',
        pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
        moon: '<path d="M20.5 13A8.5 8.5 0 0 1 11 3.5 8.5 8.5 0 1 0 20.5 13Z"/>',
        sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
        heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
        check: '<path d="m5 12 4 4L19 6"/>',
        user: '<circle cx="12" cy="8" r="4"/><path d="M4 22v-2a8 8 0 0 1 16 0v2"/>',
        menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
        close: '<path d="m6 6 12 12M6 18 18 6"/>',
        calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 11h18"/>',
        star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z"/>',
        compass: '<circle cx="12" cy="12" r="9"/><path d="m16 8-2 6-6 2 2-6Z"/>',
        wifi: '<path d="M2 8a16 16 0 0 1 20 0M5 12a11 11 0 0 1 14 0m-11 4a6 6 0 0 1 8 0"/><circle cx="12" cy="20" r=".7"/>',
        shield: '<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Z"/><path d="m8 12 3 3 5-6"/>',
        coffee: '<path d="M4 8h12v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4Zm12 0h2a3 3 0 0 1 0 6h-2M7 2v3m5-3v3"/>',
        copy: '<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V3H3v13h5"/>'
    };
    const App = {
        read(key, fallback) {
            try {
                const stored = localStorage.getItem(prefix + key);
                return stored === null ? fallback : JSON.parse(stored);
            } catch {
                return fallback;
            }
        },
        write(key, value) {
            try {
                localStorage.setItem(prefix + key, JSON.stringify(value));
            } catch {
                throw new Error(
                    'Your browser could not save this. Allow local storage or free some space, then try again.'
                );
            }
        },
        remove(key) {
            try {
                localStorage.removeItem(prefix + key);
            } catch {}
        },
        getUser() {
            const users = App.read('users', []);
            const session = App.read('session', null);
            if (!Array.isArray(users) || !session || typeof session.userId !== 'string') return null;
            return users.find((user) => user && user.id === session.userId) || null;
        },
        money(value) {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                maximumFractionDigits: 0
            }).format(Number(value) || 0);
        },
        escape(value) {
            return String(value ?? '').replace(
                /[&<>"']/g,
                (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
            );
        },
        url(page, params = {}) {
            const q = new URLSearchParams();
            Object.entries(params).forEach(([k, v]) => {
                if (v !== '' && v !== null && v !== undefined) q.set(k, String(v));
            });
            return page + (q.size ? '?' + q : '');
        },
        today() {
            const d = new Date();
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        },
        dateErrors(checkin, checkout) {
            const e = {};
            const valid = (v) =>
                /^\d{4}-\d{2}-\d{2}$/.test(v) &&
                Number.isFinite(Date.parse(v)) &&
                new Date(v).toISOString().slice(0, 10) === v;
            if (!valid(checkin)) e.checkin = 'Choose a valid check-in date.';
            else if (checkin < App.today()) e.checkin = 'Choose today or a future check-in date.';
            if (!valid(checkout)) e.checkout = 'Choose a valid check-out date.';
            else if (valid(checkin) && checkout <= checkin) e.checkout = 'Check-out must be after check-in.';
            return e;
        },
        emailError(value) {
            const email = String(value).trim();
            if (!email) return 'Enter your email address.';
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter an email like name@example.com.';
            return '';
        },
        phoneError(value) {
            const phone = String(value).trim();
            const digits = phone.replace(/\D/g, '');
            if (!phone) return 'Enter your phone number.';
            if (!/^\+?[\d ()-]+$/.test(phone) || digits.length < 7 || digits.length > 15) {
                return 'Use 7–15 digits with an optional country code, for example +7 700 123 4567.';
            }
            return '';
        },
        passwordError(password) {
            return password.length >= 8 &&
                /[a-z]/.test(password) &&
                /[A-Z]/.test(password) &&
                /\d/.test(password) &&
                /[^A-Za-z0-9\s]/.test(password)
                ? ''
                : 'Use at least 8 characters with uppercase, lowercase, a number and a symbol.';
        },
        errors(form, errors) {
            form.querySelectorAll('.field-error').forEach((el) => {
                el.textContent = '';
                el.hidden = true;
            });
            form.querySelectorAll('[aria-invalid]').forEach((el) => el.removeAttribute('aria-invalid'));
            let first;
            Object.entries(errors).forEach(([id, message]) => {
                if (!message) return;
                const field = form.querySelector('#' + CSS.escape(id));
                if (!field) return;
                let output = document.getElementById(id + '-error');
                if (!output) {
                    output = document.createElement('p');
                    output.id = id + '-error';
                    output.className = 'field-error';
                    (field.closest('.field') || field.parentElement).append(output);
                }
                output.textContent = message;
                output.hidden = false;
                field.setAttribute('aria-invalid', 'true');
                const d = new Set((field.getAttribute('aria-describedby') || '').split(' ').filter(Boolean));
                d.add(output.id);
                field.setAttribute('aria-describedby', [...d].join(' '));
                first ||= field;
            });
            if (first) first.focus();
            return Boolean(first);
        },
        icon(name) {
            return `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.compass}</svg>`;
        },
        notify(message, type = 'success') {
            const t = document.getElementById('notification');
            if (!t) return;
            clearTimeout(App.toastTimer);
            clearTimeout(App.announcementTimer);
            const content = t.querySelector('.notification-message');
            if (content) content.textContent = message;
            else t.textContent = message;
            t.dataset.type = type;
            window.jQuery(t).stop(true, true);
            t.hidden = false;

            window.jQuery(t).css('display', 'flex').hide().fadeIn(180);
            const announcement = document.getElementById('notification-announcement');
            if (announcement) {
                announcement.textContent = '';
                App.announcementTimer = setTimeout(() => {
                    announcement.textContent = message;
                }, 0);
            }
            if (type !== 'error' && !t.contains(document.activeElement)) {
                App.toastTimer = setTimeout(() => {
                    if (t.contains(document.activeElement)) return;
                    window.jQuery(t).fadeOut(350, () => {
                        t.hidden = true;
                    });
                }, 4500);
            }
        },
        favoriteIds() {
            const ids = App.read('favorites.' + (App.getUser()?.id || 'guest'), []);
            return Array.isArray(ids) ? ids.filter((id) => typeof id === 'string') : [];
        },
        toggleFavorite(id) {
            const ids = App.favoriteIds(),
                exists = ids.includes(id);
            App.write(
                'favorites.' + (App.getUser()?.id || 'guest'),
                exists ? ids.filter((i) => i !== id) : [...ids, id]
            );
            document.dispatchEvent(new Event('bookingapp:favoriteschange'));
            return !exists;
        }
    };
    window.App = App;
    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('[data-icon]').forEach((el) => (el.innerHTML = App.icon(el.dataset.icon)));
        document.getElementById('main-content')?.setAttribute('tabindex', '-1');
        const notice = document.getElementById('notification');
        if (notice) {
            const announcement = document.createElement('div');
            announcement.id = 'notification-announcement';
            announcement.className = 'sr-only';
            announcement.setAttribute('role', 'status');
            announcement.setAttribute('aria-atomic', 'true');
            document.body.appendChild(announcement);
            notice.removeAttribute('role');
            notice.removeAttribute('aria-live');
            const message = document.createElement('span');
            message.className = 'notification-message';
            const dismiss = document.createElement('button');
            dismiss.className = 'notification-dismiss';
            dismiss.type = 'button';
            dismiss.textContent = 'Dismiss';
            dismiss.setAttribute('aria-label', 'Dismiss notification');
            notice.replaceChildren(message, dismiss);
            let previousFocus;
            notice.addEventListener('focusin', (event) => {
                clearTimeout(App.toastTimer);
                window.jQuery(notice).stop(true, false).css({ display: 'flex', opacity: 1 });
                if (event.relatedTarget && !notice.contains(event.relatedTarget))
                    previousFocus = event.relatedTarget;
            });
            dismiss.addEventListener('click', () => {
                const restoreFocus = notice.contains(document.activeElement);
                clearTimeout(App.toastTimer);
                window.jQuery(notice).stop(true, false);
                notice.hidden = true;
                if (restoreFocus && previousFocus?.isConnected) previousFocus.focus();
            });
        }
        const menu = document.getElementById('main-nav'),
            menuButton = document.getElementById('menu-toggle');
        menuButton?.addEventListener('click', () => {
            const open = menuButton.getAttribute('aria-expanded') !== 'true';
            menuButton.setAttribute('aria-expanded', String(open));
            menu.classList.toggle('is-open', open);
            if (open) menu.querySelector('a')?.focus();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && menu?.classList.contains('is-open')) {
                menu.classList.remove('is-open');
                menuButton.setAttribute('aria-expanded', 'false');
                menuButton.focus();
            }
        });
        const themeButton = document.getElementById('theme-toggle');
        function renderTheme() {
            if (!themeButton) return;
            const dark = document.documentElement.dataset.theme === 'dark';
            themeButton.innerHTML = App.icon(dark ? 'sun' : 'moon');
            themeButton.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
            themeButton.setAttribute('aria-pressed', String(dark));
        }
        let themeChangeVersion = 0;
        function applyTheme(theme) {
            const version = ++themeChangeVersion;
            document.documentElement.classList.add('theme-changing');
            document.documentElement.dataset.theme = theme;
            requestAnimationFrame(() =>
                requestAnimationFrame(() => {
                    if (version === themeChangeVersion)
                        document.documentElement.classList.remove('theme-changing');
                })
            );
            renderTheme();
        }
        renderTheme();
        themeButton?.addEventListener('click', () => {
            const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
            applyTheme(theme);
            try {
                App.write('theme', theme);
            } catch (e) {
                App.notify(e.message, 'error');
            }
        });
        function renderAccount() {
            const u = App.getUser();
            document.querySelectorAll('[data-account-link]').forEach((a) => {
                a.href = u ? 'profile.html' : 'login.html';
                a.setAttribute('aria-label', u ? 'My trips' : 'Log in');
                a.innerHTML = App.icon('user') + `<span>${u ? 'My trips' : 'Log in'}</span>`;
            });
        }
        renderAccount();
        document.addEventListener('bookingapp:authchange', renderAccount);
        window.addEventListener('storage', (e) => {
            if (e.key === prefix + 'theme') {
                applyTheme(App.read('theme', 'light') === 'dark' ? 'dark' : 'light');
            }
            renderAccount();
        });
    });
})();

(() => {
    'use strict';
    const $ = window.jQuery;
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    const imageFallback = new URL('image/placeholder.svg', document.baseURI).href;

    function replaceFailedImage(image) {
        if (!(image instanceof HTMLImageElement) || image.dataset.imageFallback === 'true') return;
        image.dataset.imageFallback = 'true';
        image.removeAttribute('srcset');
        image.removeAttribute('data-src');
        image.alt = (image.alt || 'Travel photograph') + ' — image unavailable';
        image.src = imageFallback;
    }
    document.addEventListener('error', (event) => replaceFailedImage(event.target), true);

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
