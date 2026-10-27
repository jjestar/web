// Assignment 5: an array of hotel objects with a reusable method.
const hotelsDatabase = [
    {
        id: 'grand-palace',
        name: 'Grand Palace Hotel',
        location: 'Astana, Kazakhstan',
        description: 'A five-star hotel with a spa, restaurant, and city views.',
        price: 120,
        rating: 5,
        image: 'image/1.jpg',
        wifi: true, pool: true, breakfast: false,
        getPriceLabel() { return '$' + this.price + ' / night'; }
    },
    {
        id: 'ocean-view',
        name: 'Ocean View Resort',
        location: 'Miami, United States',
        description: 'A beach resort with a large pool and breakfast included.',
        price: 220,
        rating: 4,
        image: 'image/destination-8.jpg',
        wifi: true, pool: true, breakfast: true,
        getPriceLabel() { return '$' + this.price + ' / night'; }
    },
    {
        id: 'comfort-city',
        name: 'Comfort City Hotel',
        location: 'Almaty, Kazakhstan',
        description: 'A comfortable hotel near the city center with free Wi-Fi.',
        price: 85,
        rating: 4,
        image: 'image/destination-3.jpg',
        wifi: true, pool: false, breakfast: false,
        getPriceLabel() { return '$' + this.price + ' / night'; }
    }
];
