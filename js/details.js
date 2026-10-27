document.addEventListener('DOMContentLoaded', function () {
    // Task 1: select elements and update content from the selected hotel object.
    const hotelId = new URLSearchParams(window.location.search).get('hotel');
    const hotel = hotelsDatabase.find(function (item) {
        return item.id === hotelId;
    }) || hotelsDatabase[0];

    document.title = 'BookingApp - ' + hotel.name;
    document.getElementById('hotel-name').textContent = hotel.name;
    document.getElementById('hotel-location').textContent = hotel.location + ' | ' + hotel.rating + ' stars';
    document.getElementById('hotel-description').textContent = hotel.description;
    document.getElementById('hotel-price').textContent = 'Rooms from ' + hotel.getPriceLabel();
    document.getElementById('hotel-book-link').setAttribute('href', 'booking.html?hotel=' + hotel.id);

    const amenities = [];
    if (hotel.wifi) amenities.push('Free Wi-Fi');
    if (hotel.pool) amenities.push('Swimming pool');
    if (hotel.breakfast) amenities.push('Breakfast included');
    const amenitiesList = document.getElementById('hotel-amenities');
    amenitiesList.replaceChildren();
    amenities.forEach(function (amenity) {
        const item = document.createElement('li');
        item.className = 'list-group-item';
        item.textContent = amenity;
        amenitiesList.appendChild(item);
    });

    const mainImage = document.getElementById('gallery-main');
    const thumbnails = document.querySelectorAll('.gallery-thumbnail');
    const firstThumbnail = thumbnails[0];
    firstThumbnail.dataset.image = hotel.image;
    firstThumbnail.dataset.alt = hotel.name + ' photo';
    firstThumbnail.setAttribute('aria-label', 'Show ' + hotel.name + ' photo');
    firstThumbnail.querySelector('img').setAttribute('src', hotel.image);
    firstThumbnail.querySelector('img').setAttribute('alt', hotel.name + ' thumbnail');
    mainImage.setAttribute('src', hotel.image);
    mainImage.setAttribute('alt', hotel.name + ' photo');
    if (!hotel.pool) {
        thumbnails[2].dataset.image = 'image/1.jpg';
        thumbnails[2].dataset.alt = 'Example room with a city view';
        thumbnails[2].setAttribute('aria-label', 'Show city view photo');
        thumbnails[2].querySelector('img').setAttribute('src', 'image/1.jpg');
        thumbnails[2].querySelector('img').setAttribute('alt', 'City view thumbnail');
    }

    // Task 1: clicking a thumbnail changes the large image attributes.
    thumbnails.forEach(function (thumbnail) {
        thumbnail.addEventListener('click', function () {
            mainImage.setAttribute('src', thumbnail.dataset.image);
            mainImage.setAttribute('alt', thumbnail.dataset.alt);
            thumbnails.forEach(function (button) {
                button.classList.remove('selected');
                button.setAttribute('aria-pressed', 'false');
            });
            thumbnail.classList.add('selected');
            thumbnail.setAttribute('aria-pressed', 'true');

            // Task 3: a click starts a CSS animation; restart it for every photo.
            mainImage.classList.remove('gallery-enter');
            void mainImage.offsetWidth;
            mainImage.classList.add('gallery-enter');
        });
    });

    // Task 1: querySelectorAll, class changes and textContent show a user rating.
    const stars = document.querySelectorAll('.rating-star');
    const ratingMessage = document.getElementById('rating-message');
    stars.forEach(function (star) {
        star.addEventListener('click', function () {
            const selectedRating = Number(star.dataset.rating);
            stars.forEach(function (button) {
                const value = Number(button.dataset.rating);
                button.classList.toggle('selected', value <= selectedRating);
                button.setAttribute('aria-pressed', String(value === selectedRating));
            });
            ratingMessage.textContent = 'Your rating: ' + selectedRating + ' out of 5. Thank you!';
        });
    });
});
