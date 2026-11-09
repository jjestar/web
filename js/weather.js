(function () {
    'use strict';

    const panel = document.getElementById('weather-panel');
    const content = document.getElementById('weather-content');
    const retry = document.getElementById('weather-retry');
    const hotel = window.getSelectedHotel();
    if (!panel || !content || !retry || !hotel) return;
    let loading = false;

    function weatherName(code) {
        if (code === 0) return 'Clear skies';
        if (code === 1) return 'Mostly clear';
        if (code === 2) return 'Partly cloudy';
        if (code === 3) return 'Overcast';
        if ([45, 48].includes(code)) return 'Foggy';
        if ([51, 53, 55, 56, 57].includes(code)) return 'Drizzle';
        if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'Rain';
        if ([71, 73, 75, 77, 85, 86].includes(code)) return 'Snow';
        if ([95, 96, 99].includes(code)) return 'Thunderstorms';
        return 'Variable conditions';
    }

    function checkedWeather(data) {
        if (
            !data ||
            !data.current ||
            !Number.isFinite(data.current.temperature_2m) ||
            !Number.isFinite(data.current.weather_code)
        )
            throw new Error('Weather is unavailable.');
        const daily = data.daily;
        if (!daily || !Array.isArray(daily.time) || daily.time.length < 3)
            throw new Error('Weather is unavailable.');
        ['weather_code', 'temperature_2m_max', 'temperature_2m_min'].forEach((key) => {
            if (
                !Array.isArray(daily[key]) ||
                daily[key].length < 3 ||
                !daily[key].slice(0, 3).every(Number.isFinite)
            )
                throw new Error('Weather is unavailable.');
        });
        if (
            !daily.time
                .slice(0, 3)
                .every((date) => /^\d{4}-\d{2}-\d{2}$/.test(date) && Number.isFinite(Date.parse(date)))
        )
            throw new Error('Weather is unavailable.');
        return data;
    }

    function renderWeather(data) {
        const current = document.createElement('div');
        current.className = 'weather-current';
        const temperature = document.createElement('strong');
        temperature.className = 'weather-temperature';
        temperature.textContent = Math.round(data.current.temperature_2m) + '°C';
        const description = document.createElement('p');
        description.textContent = weatherName(data.current.weather_code) + ' in ' + hotel.city;
        const label = document.createElement('span');
        label.className = 'muted small';
        label.textContent = 'Current conditions';
        current.append(temperature, description, label);
        const forecast = document.createElement('div');
        forecast.className = 'forecast-grid';
        data.daily.time.slice(0, 3).forEach((date, index) => {
            const day = document.createElement('div');
            day.className = 'forecast-day';
            const heading = document.createElement('strong');
            heading.textContent =
                index === 0
                    ? 'Today'
                    : new Intl.DateTimeFormat('en', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short'
                      }).format(new Date(date + 'T12:00:00'));
            const condition = document.createElement('p');
            condition.className = 'small muted';
            condition.textContent = weatherName(data.daily.weather_code[index]);
            const range = document.createElement('span');
            range.textContent =
                Math.round(data.daily.temperature_2m_min[index]) +
                '° / ' +
                Math.round(data.daily.temperature_2m_max[index]) +
                '°C';
            day.append(heading, condition, range);
            forecast.append(day);
        });
        content.replaceChildren(current, forecast);
    }

    async function loadWeather() {
        if (loading) return;
        loading = true;
        panel.setAttribute('aria-busy', 'true');
        retry.hidden = true;
        retry.disabled = true;
        content.innerHTML =
            '<p class="muted weather-loading"><span class="spinner" aria-hidden="true"></span> Loading the forecast for ' +
            App.escape(hotel.city) +
            '…</p>';
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 12000);
        try {
            const query = new URLSearchParams({
                latitude: String(hotel.latitude),
                longitude: String(hotel.longitude),
                current: 'temperature_2m,weather_code',
                daily: 'weather_code,temperature_2m_max,temperature_2m_min',
                timezone: 'auto',
                forecast_days: '3'
            });
            const response = await fetch('https://api.open-meteo.com/v1/forecast?' + query, {
                signal: controller.signal
            });
            if (!response.ok) throw new Error('Weather request failed.');
            renderWeather(checkedWeather(await response.json()));
        } catch (_) {
            content.innerHTML =
                '<p><strong>Weather unavailable</strong></p><p class="muted">Check your connection and try again. You can continue planning while the weather service is unavailable.</p>';
            retry.hidden = false;
        } finally {
            clearTimeout(timeout);
            loading = false;
            retry.disabled = false;
            panel.setAttribute('aria-busy', 'false');
        }
    }

    retry.addEventListener('click', loadWeather);
    loadWeather();
})();
