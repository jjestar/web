BookingApp - Assignment 5
Team: BookingApp
Group: SE-2513
Members: Allazhar Aldongarov, Dias Serikov, Yerkenov Abylay

HOW TO OPEN
1. Extract the entire ZIP into one folder.
2. Open index.html in a browser.
3. Keep the css, js and image folders beside the HTML files.
4. Internet access is needed for Bootstrap from its existing CDN links.

No npm installation, build command, account or backend is needed.

FILES
Home and Search: index.html, search-results.html, css/allstyle.css, js/script.js
Booking and Hotel Details: booking.html, hotel-detail.html, css/style.css, js/booking.js
About and Services: about.html, services.html, css/ablstyle.css, js/about-services.js
Each page group includes its own menu navigation, click-sound behavior and styles in the files listed above.
Shared hotel data: js/hotels.js, used by Search, Hotel Details and Booking.
Click sound: image/click.mp3

DEMONSTRATION
1. Search: apply 5 stars to show Grand Palace Hotel. Apply 4 stars to show hotels with a rating of at least 4. Try the amenity filters and reset.
2. Navigation: press Tab until a menu link is focused. Use the arrow keys to move between menu links, then Enter to open one.
3. Choose View Details for any hotel. Its name, pictures and price carry through to Book This Hotel and the booking review. Use Read More to expand and collapse the extra description.
4. Booking: complete the guest step, then the stay step. Go Back to see that values remain. Review the summary, confirm the terms and finish the demo booking.
5. Services: choose a service and quantity, then calculate its estimated price.
6. Home or Search: open the subscription popup, test an invalid email, change the background and watch the clock.
7. Click a button to hear the supplied sound. The same audio instance is restarted, so clicks do not create overlapping sound instances.

The old Assignment 4 interactions are retained. The teammate's hotel array, dynamic cards, rating filter and audio asset are integrated with the remaining requirements.

The forms are frontend demonstrations. They do not create real bookings or accounts, send messages, or store payment information. Use invented values for testing.

PUBLICATION
Shared repository: https://github.com/jjestar/web
Deployed website (Vercel): https://aishhko.vercel.app/
GitHub Pages: https://jjestar.github.io/web/
The main branch is published automatically. No build step is needed.

For a simple explanation of the code in Russian, read EXPLANATION_RU.txt.
