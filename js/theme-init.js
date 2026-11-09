/* Apply saved appearance before the first paint. */
try {
    const theme = JSON.parse(localStorage.getItem('bookingapp.theme'));
    document.documentElement.dataset.theme =
        theme === 'dark' || theme === 'light'
            ? theme
            : matchMedia('(prefers-color-scheme: dark)').matches
              ? 'dark'
              : 'light';
} catch {
    document.documentElement.dataset.theme = 'light';
}
try {
    const background = JSON.parse(localStorage.getItem('bookingapp.background'));
    document.documentElement.dataset.backdrop =
        Number.isInteger(background) && background >= 0 && background <= 4 ? String(background) : '0';
} catch {
    document.documentElement.dataset.backdrop = '0';
}
