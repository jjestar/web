BookingApp - Assignment 5
Team: BookingApp | Group: SE-2513
Members: Allazhar Aldongarov, Dias Serikov, Yerkenov Abylay

RUN
Open index.html or serve this folder with a static web server. No build needed.
Internet is needed for Bootstrap 5.3.2 styles and its mobile menu from jsDelivr.

DEPLOYMENT
Repository: https://github.com/jjestar/web
Assignment website: https://jjestar.github.io/web/
Existing Vercel website: https://aishhko.vercel.app/
GitHub Pages publishes main from the repository root. All asset paths are relative.

CODE MAP
js/hotels.js: hotel array, objects, getPriceLabel() method.
js/script.js: popup, validation, background color, clock, search and filters.
js/common.js: arrow-key navigation, one Audio object, mute, button animation.
js/details.js: selected hotel, thumbnail gallery, star rating.
js/booking.js: three-step form, callbacks, validation, booking price methods.
js/about-services.js: clock, service FAQ, local contact form validation.
css/interactive.css: shared interaction and animation styles.
css/allstyle.css, style.css, ablstyle.css: existing page layouts.
image/: supplied photographs and click.mp3.

DEMONSTRATE
1. Search: 5 stars and Apply Filters shows one hotel. Add Breakfast: none.
   Clear Filters restores all three. Search by Astana, Miami, or Almaty.
2. Hotel Details: select another thumbnail and then the fourth rating star.
3. Tab to a menu link, use Left/Right or Up/Down, then Enter.
4. Booking: Guest details, Next, Stay details, Next, review total.
   Back preserves values. Confirm requires terms. Clear Form resets all steps.
   Test: Demo Student, student@example.com, DemoPass123 in both password fields,
   2026-11-01 to 2026-11-03, phone 7000000000 after +7.
5. Any page: click a button to hear click.mp3; Sound: Off mutes it.
6. Apply Filters animates hotel cards. Gallery and booking steps also animate.
7. Home/Search: Change Background Theme; Subscribe for Discounts; Escape closes.
8. About: contact fields validate locally and show a status without reload.

This frontend demo does not create server bookings, accounts, ratings,
subscriptions or outgoing email. Passwords are not saved or sent.
Date inputs check ordering; they do not check real hotel availability.

SUBMISSION
Insert code and webpage screenshots in Assignment5_Report.docx, then export
it as Assignment5_Report.pdf. Submit the PDF and BookingApp_Assignment5.zip.
The separate Russian screenshot guide explains every screenshot slot.
Every member submits and prepares for the practice defense (40% of the grade).
