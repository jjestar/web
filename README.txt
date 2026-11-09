BookingApp — Final Project
Group: SE-2513
Team: Allazhar Aldongarov, Dias Serikov, Yerkenov Abylay

LIVE WEBSITE: https://jjestar.github.io/web/
REPOSITORY: https://github.com/jjestar/web

PURPOSE
A responsive travel website for comparing illustrative hotel stays and planning
a demo trip. This project is entirely static HTML, CSS and JavaScript.
There is no backend, database server, real reservation, payment or email delivery.

RUN LOCALLY
Use a static server from this folder, for example:
  python -m http.server 8124 --bind 127.0.0.1
Then open http://127.0.0.1:8124/
No npm installation, build command or API key is required.
HTTPS or localhost is recommended for the browser's password hashing API.
Internet is needed only for Open-Meteo weather. All photos, icons, styles and
application scripts are local; the rest of the site works if the weather fails.

NINE CONNECTED PAGES
index.html          Home, destination search, FAQ, saved newsletter preference
search-results.html Live search, amenity/category filters, sorting and favourites
hotel-detail.html   Selected hotel, gallery, amenities, weather and booking link
booking.html        Three steps: stay, guest details, review and confirmation
services.html       Travel services and a dynamic price estimator
about.html          Project purpose, original team and local contact draft form
signup.html         Local demo registration with JavaScript validation
login.html          Local credential check and redirect to profile
profile.html        Account details, saved stays, bookings and cancellation

HOW TO DEMONSTRATE
1. On Home, choose Miami and any future check-in/check-out dates, then 2 guests.
2. Search results update instantly with text, category and amenity filters.
   Try 'pool', 'Astana', 'Paris' or an unmatched word; Clear filters resets them.
   Sorting and filters persist. The heart buttons save favourites.
3. Open Ocean View Resort. The selected stay and dates reach the booking page.
   Open-Meteo shows current weather plus three days, with loading/error/retry.
4. Choose Deluxe and Car rental. For 3 nights: ($220+$40)*3 + $55*3 = $945.
5. Invalid/empty inputs show errors below fields. Continue to Review.
6. Create a demo account using invented details. A password such as Travel2026!
   demonstrates uppercase, lowercase, digit and symbol checks. Do not reuse a
   real password. Registration/login opens Profile. Continue booking returns
   to the chosen trip with the entered information preserved.
7. Confirm the demo acknowledgement and save. The profile shows the booking.
   Cancel requires an explicit inline confirmation; keeping it is also possible.
8. Toggle the sun/moon button, change page and reload. The appearance persists.
9. In Services, compare transfer ($35 once), car ($55/day), tour ($45/person).
   Continue to booking keeps the selected service. Final cost uses trip dates
   and guests, as explained beside the estimator.
10. Contact saves a local draft, validates the selected reply method and can
    download a TXT copy. Newsletter also saves locally; neither sends email.

STORAGE AND AUTHENTICATION
All state uses localStorage with the bookingapp. prefix. Users are separate
records; the current session stores only userId. Passwords are stored as salted
SHA-256 digests rather than readable passwords. Authentication is a coursework
simulation, not a secure production identity system. Browser storage can be
inspected or changed by its owner and is not synchronized to other devices.
Keys include users, session, theme, search, filters, favorites.<userId>, bookings,
bookingDraft, pendingBookingUrl, contactDraft and newsletter.
Clearing this site's browser storage removes all locally saved information.

JAVASCRIPT VALIDATION
All forms use novalidate. Application code checks required values, email syntax,
password length/complexity, matching confirmation, international phone format,
future dates, date order, integer guest counts and service quantities.
No required, pattern, minlength, maxlength, min, max or type=email attributes
are used as the validation mechanism. Errors appear beside fields; focus moves
to the first invalid field. Authentication and storage errors remain visible.

API
Open-Meteo Forecast API: https://open-meteo.com/en/docs
GET https://api.open-meteo.com/v1/forecast
Uses each hotel's coordinates with current temperature/weather code and three
calendar days of weather code/min/max temperature. Requests use fetch and
async/await, a 12-second AbortController timeout, HTTP/response checks, a loading
state and retry UI. Attribution links to Open-Meteo. The forecast is current,
not the weather on the selected booking dates. No API key is shipped.

FILE ORGANIZATION
css/site.css             Shared tokens, page components, responsive/dark modes
js/theme-init.js         Appearance applied before first paint
js/common.js             Shared helpers, storage, validation, nav, notifications
js/hotels.js             Six illustrative listings and selected-hotel lookup
js/script.js             Home and dynamic search/filter behaviour
js/auth.js               Registration, login, profile, saved stays, cancellation
js/booking.js            Hotel details, trip continuity, booking and pricing
js/weather.js            Open-Meteo request and loading/error/success states
js/about-services.js     Contact drafts and service estimator
image/                   Local photos, SVG logo variants and matching favicon
archive/                 Previous assignment reports and explanation (historical)

DESIGN AND ACCESSIBILITY
The home page pairs a Paris destination feature with an immediately usable
search form. Photo captions identify the destination, listing and nightly rate.
Search results use comparison rows; services and destination photos use open
layouts. Interface headings use the system sans-serif; destination names use
Georgia. Photos are illustrative, with descriptions matched to their subjects.
The custom logo combines a destination pin and a doorway. The BookingApp
wordmark has no trailing punctuation; the mark adapts to both color themes.
CSS Grid and Flexbox; responsive layouts; persistent light/dark semantic colors;
visible focus; labelled form controls; skip link; mobile navigation with Escape;
aria-live feedback; native keyboard-friendly FAQ; reduced-motion support.
Shared spacing follows a 4px rhythm with small 2px control adjustments. Prices
use tabular figures. Hover feedback changes color without moving hotel cards;
button press feedback respects reduced motion. Form boundaries have a separate
contrast token. Error notices stay visible until dismissed, and mobile menu
focus enters its first link. Theme changes suppress intermediate transitions.
No third-party UI framework, external font, tracking script or backend required.

VERIFICATION
Browser tests covered all 9 pages at 360, 390, 768 and 1440 CSS pixels in light
and dark modes; no horizontal overflow, missing local images or JS errors were
found. Tested the full signup/login/profile/booking/cancel journey, invalid
forms, filters, persistence, service estimates, contact draft/download and
Open-Meteo success plus simulated failure/retry. Test data is not bundled.
116 additional layout/interaction checks passed at 320 and 640px in both themes,
including expanded forms, booking review, long account names and notifications.
Measured field-border
contrast: 3.67:1 light and 4.46:1 dark; primary-button text: 7.00:1 and 8.42:1.

HOSTING
GitHub Pages serves the main branch from the repository root. .nojekyll keeps
static files served directly. Open index.html as the entry point. Relative links
work under /web/. Push completed changes to main to update the hosted website.

TEAM
The original project records these roles:
Allazhar Aldongarov — Frontend Developer
Dias Serikov — UI Designer
Yerkenov Abylay — Content and Testing
The report describes final features as shared project work, without assigning
unverified individual authorship of later changes.

SUBMISSION
Each student submits the complete project ZIP, the final PDF report and the TXT
with both links in Moodle FINAL EXAM FOLDER. Presentation: up to 5 minutes;
every team member participates. Deadline: 18 November 2026, 23:59.
