BookingApp — Final Project
Group: SE-2513
Team: Serikov Dias, Yerkenov Abylai, Allazhar Aldongarov

LIVE WEBSITE: https://jjestar.github.io/web/
REPOSITORY: https://github.com/jjestar/web

PURPOSE
A responsive travel website for comparing illustrative hotel stays and planning
a trip. This project is entirely static HTML, CSS and JavaScript.
There is no backend, database server, real reservation, payment or email delivery.

RUN LOCALLY
Use a static server from this folder, for example:
  python -m http.server 8124 --bind 127.0.0.1
Then open http://127.0.0.1:8124/
No npm installation, build command or API key is required.
HTTPS or localhost is recommended for the browser's password hashing API.
Internet is needed only for Open-Meteo weather. All photos, icons, styles and
application scripts are local; the rest of the site works if the weather fails.
jQuery 4.0.0 and the Bootstrap 5.3.2 JavaScript bundle are included in js/vendor/.
They load locally; no CDN or package installation is needed to run the site.

NINE CONNECTED PAGES
index.html          Home, custom search suggestions, carousel, FAQ, newsletter
search-results.html Live search, amenity/category filters, sorting and favourites
hotel-detail.html   Gallery, amenities, weather, Read More and sample reviews
booking.html        Three steps: stay, guest details, review and confirmation
services.html       Travel services and a dynamic price estimator
about.html          Project purpose, original team and local contact draft form
signup.html         Local account registration with JavaScript validation
login.html          Local credential check and redirect to profile
profile.html        Account details, saved stays, bookings and cancellation

PRESENTATION FLOW
1. On Home, choose Miami and any future check-in/check-out dates, then 2 guests.
2. Search results update instantly with text, category and amenity filters.
   Try 'pool', 'Astana', 'Paris' or an unmatched word; Clear filters resets them.
   Sorting and filters persist. The heart buttons save favourites.
3. Open Ocean View Resort. The selected stay and dates reach the booking page.
   Open-Meteo shows current weather plus three days, with loading/error/retry.
4. Choose Deluxe and Standard Car rental. For 3 nights:
   ($220+$40)*3 + $35*3 = $885; the car rental portion is $105.
5. Invalid/empty inputs show errors below fields. Continue to Review.
6. Create an account using invented details. A password such as Travel2026!
   demonstrates uppercase, lowercase, digit and symbol checks. Do not reuse a
   real password. Registration/login opens Profile. Continue booking returns
   to the chosen trip with the entered information preserved.
7. Confirm the booking acknowledgement and save. Logged-in bookings appear in the
   profile and can be cancelled with inline confirmation. Without an account,
   confirm as a guest to create a receipt for this browser tab instead.
   Copy booking details works before and after confirmation. Clear Form resets
   the plan even after success, without deleting any saved profile bookings.
8. Toggle the sun/moon button, change page and reload. The appearance persists.
9. In Services, compare Standard, Premium and VIP using the pricing table and
   estimator. Continue to booking keeps the service, tier and quantity.
   Standard rates: transfer $25/one-way trip, car $35/day, tour $20/person.
   Premium: transfer $45/round trip, car $70/day, private guide $50/party.
   VIP: transfer included ($0), car $120/day, special tour $100/party.
   Transfers accept 1-30 trips. Booking car days follow the nights; Standard
   tour quantity follows guests. Premium/VIP tours are charged once per party.
10. Contact saves a local draft, validates the selected reply method and can
    download a TXT copy. Newsletter also saves locally; neither sends email.

RESTORED ASSIGNMENT 5/6 FEATURES
Custom destination/search suggestions support mouse and keyboard selection.
The Bootstrap destination carousel has previous/next, slide selectors and a
pause/play control, with reduced-motion support. The newsletter popup remains
a local simulation. Shared jQuery notification effects, copy buttons, live
clock, page-background choices, optional click sound and arrow/Home/End menu
navigation are functional. Contact/service forms include clear actions and
submit loading feedback. About includes animated counters; Services includes
scroll progress and the original tiered price comparison. Hotel Read More/Read
Less restores the additional description. Original sample guest reviews are
explicitly labelled fictional; they are not presented as real customer reviews.
The jQuery lazy loader retains data-src placeholders until photographs enter
the viewport, including new results and carousel slides. Failed images use
the local placeholder. Search highlights every occurrence of the query.

STORAGE AND AUTHENTICATION
Persistent state uses localStorage with the bookingapp. prefix. Users are separate
records; the current session stores only userId. Passwords are stored as salted
SHA-256 digests rather than readable passwords. Authentication is a coursework
simulation, not a secure production identity system. Browser storage can be
inspected or changed by its owner and is not synchronized to other devices.
Keys include users, session, theme, search, filters, favorites.<userId>, bookings,
bookingDraft, pendingBookingUrl, serviceEstimate, contactDraft and newsletter.
Guest confirmations use sessionStorage key bookingapp.guestReceipt, separate
from account bookings. The guest receipt lasts for the browser tab's session.
Clear Form removes the current draft, pending continuation and stored selection;
it clears guest receipts and prevents old URL dates from refilling the form.
Saved profile bookings and their historical totals remain unchanged. Password
fields belong to signup/login, not the guest booking form.
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
css/assignment*.css      Restored controls, carousel, booking and service styles
js/theme-init.js         Appearance applied before first paint
js/common.js             Shared helpers, storage, validation, nav, notifications
js/assignment.js         jQuery lazy images, clock, page color, sound and copying
js/vendor/               Local jQuery 4.0.0 and Bootstrap 5.3.2 JavaScript files
js/hotels.js             Six illustrative listings and selected-hotel lookup
js/script.js             Home and dynamic search/filter behaviour
js/auth.js               Registration, login, profile, saved stays, cancellation
js/booking.js            Hotel details, trip continuity, booking and pricing
js/weather.js            Open-Meteo request and loading/error/success states
js/about-services.js     Contact drafts and service estimator
js/services-data.js      Shared Standard/Premium/VIP rates and quote helper
image/                   Local photos, travel photography and illustrations
archive/                 Previous assignment reports and explanation (historical)

DESIGN AND ACCESSIBILITY
The home page pairs a Paris destination feature with an immediately usable
search form. Photo captions identify the destination, listing and nightly rate.
Search results use comparison rows; services and destination photos use open
layouts. Interface headings use the system sans-serif; destination names use
Georgia. Photos are illustrative, with descriptions matched to their subjects.
CSS Grid and Flexbox; responsive layouts; persistent light/dark semantic colors;
visible focus; labelled form controls; skip link; mobile navigation with Escape;
aria-live feedback; native keyboard-friendly FAQ; reduced-motion support.
Shared spacing follows a 4px rhythm with small 2px control adjustments. Prices
use tabular figures. Hover feedback changes color without moving hotel cards;
button press feedback respects reduced motion. Form boundaries have a separate
contrast token. Error notices stay visible until dismissed, and mobile menu
focus enters its first link. Theme changes suppress intermediate transitions.
The carousel uses Bootstrap's JavaScript; restored interactions use jQuery.
Page styling remains local CSS. No external font, tracking script or backend.

VERIFICATION
Verification covers connected pages, responsive layouts, form errors, local
storage, account and guest booking paths, and API loading/error/retry states.
Restoration browser checks verified every service/tier calculation, rejected
invalid transfer quantities, retained selections through login, kept guest
receipts separate, and preserved historical totals and saved bookings on reset.
Booking/detail checks at 390, 768 and 1440 CSS pixels found no horizontal
overflow, prohibited validation attributes or JavaScript errors. Test data is
not bundled. Recheck the published version before submitting.

HOSTING
GitHub Pages serves the main branch from the repository root. .nojekyll keeps
static files served directly. Open index.html as the entry point. Relative links
work under /web/. Push completed changes to main to update the hosted website.

TEAM
The original project records these roles:
Serikov Dias — UI Designer
Yerkenov Abylai — Content and Testing
Allazhar Aldongarov — Frontend Developer
The report describes final features as shared project work, without assigning
unverified individual authorship of later changes.

SUBMISSION
Each student submits the complete project ZIP, the final PDF report and the TXT
with both links in Moodle FINAL EXAM FOLDER. Presentation: up to 5 minutes;
every team member participates. Deadline: 18 November 2026, 23:59.
