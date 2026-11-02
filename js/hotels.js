const hotelsDatabase = [
    {
        id: 'grand-palace',
        name: 'Grand Palace Hotel',
        location: 'Astana, Kazakhstan',
        description: 'A five-star hotel with a spa, restaurant, and city views.',
        price: 120,
        rating: 5,
        image: 'image/1.jpg',
        wifi: true,
        pool: true,
        breakfast: false,
        amenities: ['Free high-speed Wi-Fi', '24/7 room service', 'Spa, sauna, and indoor pool', 'Fitness center and free parking'],
        photos: [
            { src: 'image/1.jpg', alt: 'Grand Palace Hotel city view' },
            { src: 'image/3.jpg', alt: 'Grand Palace Hotel bedroom' },
            { src: 'image/2.jpg', alt: 'Grand Palace Hotel swimming pool' }
        ]
    },
    {
        id: 'ocean-view',
        name: 'Ocean View Resort',
        location: 'Miami, United States',
        description: 'A beach resort with a large pool and breakfast included.',
        price: 220,
        rating: 4,
        image: 'image/destination-8.jpg',
        wifi: true,
        pool: true,
        breakfast: true,
        amenities: ['Free Wi-Fi', 'Swimming pool', 'Breakfast included', 'Beach access'],
        photos: [
            { src: 'image/destination-8.jpg', alt: 'Ocean View Resort swimming pool' },
            { src: 'image/destination-9.jpg', alt: 'Ocean View Resort hotel grounds' },
            { src: 'image/destination-3.jpg', alt: 'Ocean View Resort example room' }
        ]
    },
    {
        id: 'comfort-city',
        name: 'Comfort City Hotel',
        location: 'Almaty, Kazakhstan',
        description: 'A comfortable hotel near the city center with free Wi-Fi.',
        price: 85,
        rating: 4,
        image: 'image/destination-3.jpg',
        wifi: true,
        pool: false,
        breakfast: false,
        amenities: ['Free Wi-Fi', 'City center location', 'Comfortable rooms'],
        photos: [
            { src: 'image/destination-3.jpg', alt: 'Comfort City Hotel example room' },
            { src: 'image/3.jpg', alt: 'Comfort City Hotel example bedroom' },
            { src: 'image/1.jpg', alt: 'Comfort City Hotel example city view' }
        ]
    }
];

function getSelectedHotel() {
    const hotelId = new URLSearchParams(window.location.search).get('hotel');
    return hotelsDatabase.find(function (hotel) {
        return hotel.id === hotelId;
    }) || hotelsDatabase[0];
}
