BookingApp - Assignment 6: jQuery
Team: BookingApp
Group: SE-2513
Members: Allazhar Aldongarov, Dias Serikov, Yerkenov Abylay

HOW TO RUN
Extract the complete ZIP and open index.html in a modern browser.
Keep the css, js and image folders beside the HTML files.
Internet access is required for the jQuery 4.0.0 and Bootstrap CDN files.
No npm install, build step, account or backend is required.
Optional: run python -m http.server 8000 from this folder, then open
http://localhost:8000 in a browser. Clipboard behavior is best tested on
localhost or the published HTTPS website.

TASK DEMONSTRATION
0. Setup: open Home or Search and check the browser console for
   "jQuery is ready!". jQuery is loaded in the HTML head before our scripts.
1. Live search: on Search, type a hotel name, city or description keyword.
   Try "hotel", "Astana" or "pool". Combine the search with rating and
   amenity filters. Clear Filters resets both the text and filter controls.
   The destination entered on Home also initializes the Search page.
2. Autocomplete: type "ast" or "oce" on Search. Click a suggestion or use
   Arrow Up/Down and Enter. Escape closes the suggestion list.
3. Highlighting: type "hotel" on Search. All matching text in the result
   cards is highlighted. Clear the input to remove the highlights.
4. Scroll progress: open About or Services and scroll from top to bottom.
   The colored progress bar at the top follows your position.
5. Number counters: open About and scroll to the statistics section.
   The three counters animate once when the section enters the viewport.
6. Submit spinner: submit valid Contact fields on About or calculate a
   service estimate on Services. The button shows "Please wait...", is
   disabled during the short simulated request, and then returns to normal.
7. Notifications: submit a valid demo subscription, Contact form or service
   estimate, or confirm a demo booking. A temporary notification fades out.
8. Clipboard: open Hotel Details and click Copy hotel location. On the
   booking Review step, Copy booking details copies the displayed summary.
   Successful copying shows a checkmark and "Copied to clipboard!".
9. Lazy loading: open Search in a fresh browser tab at a normal window
   height. In DevTools Network, observe the image requests while scrolling
   down. Result images below the viewport load when they come into view.
   The lazy loader also handles new results after searching or filtering.

EXISTING FEATURES
Hotel selection is preserved between Search, Hotel Details and Booking.
The booking form validates guest details, dates and terms before confirming.
FAQ accordions, the theme button, live clock, keyboard navigation, click
sound and service calculator remain available.

FILE MAP
index.html, search-results.html: Home and Search pages.
js/script.js, css/allstyle.css: search, suggestions, highlights and Home UI.
about.html, services.html: team, Contact and travel service pages.
js/about-services.js, css/ablstyle.css: progress, counters, spinner and forms.
hotel-detail.html, booking.html: selected hotel and booking workflow.
js/booking.js, css/style.css: hotel details, validation and booking summary.
js/hotels.js: shared data for the three example hotels.
js/common.js, css/common.css: notifications, clipboard and lazy loading.
image/: local images, placeholder.svg and the click.mp3 sound.

PROJECT LINKS
Shared repository: https://github.com/jjestar/web
GitHub Pages: https://jjestar.github.io/web

DEMO NOTICE
This is a frontend coursework project. No account, payment, reservation,
message or email is created or sent. Use invented data when testing forms.
Copy buttons copy the selected visible text to your device clipboard.
