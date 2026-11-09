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
