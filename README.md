# Booking App

A responsive hotel booking website built for our **SE-2513 final project**. Users can compare hotels, save favourites, plan a stay and calculate travel service costs.

**[Open the website](https://jjestar.github.io/web/)**

## Team

| Name | Main responsibility |
| --- | --- |
| Serikov Dias | UI design |
| Yerkenov Abylay | Content and testing |
| Allazhar Aldongarov | Frontend development |

## Features

- Hotel search with suggestions, amenity filters and sorting.
- Sign up, log in and profile with locally saved details.
- Favourites, three-step booking and cancellation.
- Airport transfer, car rental and tour estimates with Standard, Premium and VIP prices.
- Current weather and a three-day forecast from Open-Meteo.
- Responsive layouts, saved light and dark modes, carousel and small UI animations.
- JavaScript form validation with errors beside the fields. All forms use `novalidate`.

## Pages

| File | Page |
| --- | --- |
| `index.html` | Home |
| `search-results.html` | Hotel search and filters |
| `hotel-detail.html` | Hotel details and weather |
| `booking.html` | Booking form and confirmation |
| `services.html` | Travel services and price estimator |
| `about.html` | About, team and contact form |
| `signup.html` | Create an account |
| `login.html` | Log in |
| `profile.html` | Profile, favourites and bookings |

## Built with

HTML, CSS Grid, Flexbox, JavaScript, jQuery and the Bootstrap carousel. Weather data comes from the [Open-Meteo API](https://open-meteo.com/).

Styles are in `css/`, scripts in `js/` and images in `image/`. Shared hotel and service data are in `js/data.js`. Library licenses are included in `THIRD-PARTY-LICENSES.txt` and `js/vendor/`.

## Run locally

Open the folder in VS Code and use Live Server, or start a local server from the project folder with Python.

```sh
python -m http.server 8000
```

Then open [localhost:8000](http://localhost:8000/). Internet access is needed for weather data.

## Browser storage

Accounts, favourites, bookings and the selected theme are saved in `localStorage`. Guest booking receipts use `sessionStorage` for the current tab. Account passwords are stored as salted hashes.

This coursework project simulates bookings. Contact messages and newsletter preferences are saved locally. Clearing browser storage removes the saved data.
