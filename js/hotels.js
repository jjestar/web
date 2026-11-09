/* Illustrative listings for this frontend project, not a live hotel inventory. */
window.hotelsDatabase = [
    {
        id: 'grand-palace',
        name: 'Grand Palace Hotel',
        city: 'Astana',
        country: 'Kazakhstan',
        location: 'Astana, Kazakhstan',
        tag: 'City escape',
        price: 120,
        rating: 5,
        description:
            'A city stay in Astana with an indoor pool, fitness room, and restaurant. Choose a standard room, deluxe room, or suite.',
        image: 'image/1.jpg',
        wifi: true,
        pool: true,
        breakfast: false,
        latitude: 51.1694,
        longitude: 71.4491,
        amenities: [
            'Complimentary Wi-Fi',
            'Indoor swimming pool',
            'Fitness room',
            'On-site restaurant',
            'Luggage storage',
            'City views'
        ],
        photos: [
            {
                src: 'image/1.jpg',
                alt: 'Illustrative hotel room with floor-to-ceiling windows and city views'
            },
            { src: 'image/3.jpg', alt: 'Illustrative guest bedroom with a double bed' },
            { src: 'image/2.jpg', alt: 'Illustrative outdoor pool with shaded loungers' }
        ]
    },
    {
        id: 'ocean-view',
        name: 'Ocean View Resort',
        city: 'Miami',
        country: 'United States',
        location: 'Miami, United States',
        tag: 'By the water',
        price: 220,
        rating: 4,
        description:
            'A Miami resort with a pool, beach access, and breakfast included. Rooms include Wi-Fi and air conditioning.',
        image: 'image/destination-8.jpg',
        wifi: true,
        pool: true,
        breakfast: true,
        latitude: 25.7617,
        longitude: -80.1918,
        amenities: [
            'Complimentary Wi-Fi',
            'Outdoor swimming pool',
            'Breakfast included',
            'Beach access',
            'Outdoor terrace',
            'Air conditioning'
        ],
        photos: [
            {
                src: 'image/destination-8.jpg',
                alt: 'Illustrative resort courtyard with palms and a pool under a pink sky'
            },
            {
                src: 'image/destination-9.jpg',
                alt: 'Illustrative poolside terrace beside a wooden resort building'
            },
            { src: 'image/3.jpg', alt: 'Illustrative guest bedroom with a double bed' }
        ]
    },
    {
        id: 'comfort-city',
        name: 'Comfort City Hotel',
        city: 'Almaty',
        country: 'Kazakhstan',
        location: 'Almaty, Kazakhstan',
        tag: 'Mountain gateway',
        price: 85,
        rating: 4,
        description:
            'A central Almaty base with Wi-Fi, a work desk, and tea and coffee. A practical option for city visits and mountain day trips.',
        image: 'image/3.jpg',
        wifi: true,
        pool: false,
        breakfast: false,
        latitude: 43.2389,
        longitude: 76.8897,
        amenities: [
            'Complimentary Wi-Fi',
            'Central location',
            'Air conditioning',
            'Luggage storage',
            'Work desk',
            'Tea and coffee'
        ],
        photos: [
            { src: 'image/3.jpg', alt: 'Illustrative guest bedroom with a double bed' },
            {
                src: 'image/1.jpg',
                alt: 'Illustrative hotel room with floor-to-ceiling windows and city views'
            },
            { src: 'image/destination-6.jpg', alt: 'Travel planning with a map, notebook, and camera' }
        ]
    },
    {
        id: 'paris-atelier',
        name: 'Atelier Paris Stay',
        city: 'Paris',
        country: 'France',
        location: 'Paris, France',
        tag: 'Culture & cafés',
        price: 175,
        rating: 4,
        description:
            'A Paris city stay with breakfast, Wi-Fi, a work desk, and luggage storage. Explore neighbourhood cafés between city walks.',
        image: 'image/destination-4.jpg',
        wifi: true,
        pool: false,
        breakfast: true,
        latitude: 48.8566,
        longitude: 2.3522,
        amenities: [
            'Complimentary Wi-Fi',
            'Breakfast included',
            'Neighbourhood cafés',
            'Luggage storage',
            'Work desk',
            'Tea and coffee'
        ],
        photos: [
            { src: 'image/destination-4.jpg', alt: 'An illuminated bridge over the Seine in Paris at dusk' },
            { src: 'image/3.jpg', alt: 'Illustrative guest bedroom with a double bed' },
            {
                src: 'image/1.jpg',
                alt: 'Illustrative hotel room with floor-to-ceiling windows and city views'
            }
        ]
    },
    {
        id: 'dubai-harbour',
        name: 'Harbour House Dubai',
        city: 'Dubai',
        country: 'United Arab Emirates',
        location: 'Dubai, United Arab Emirates',
        tag: 'Skyline stays',
        price: 195,
        rating: 5,
        description:
            'A Dubai stay with a swimming pool, fitness room, and on-site restaurant. Breakfast and Wi-Fi are included.',
        image: 'image/destination-5.jpg',
        wifi: true,
        pool: true,
        breakfast: true,
        latitude: 25.2048,
        longitude: 55.2708,
        amenities: [
            'Complimentary Wi-Fi',
            'Swimming pool',
            'Breakfast included',
            'Fitness room',
            'Air conditioning',
            'On-site restaurant'
        ],
        photos: [
            { src: 'image/destination-5.jpg', alt: 'Dubai skyline with the Burj Khalifa in warm sunlight' },
            { src: 'image/2.jpg', alt: 'Illustrative outdoor pool with shaded loungers' },
            { src: 'image/3.jpg', alt: 'Illustrative guest bedroom with a double bed' }
        ]
    },
    {
        id: 'island-retreat',
        name: 'Island Retreat',
        city: 'Maldives',
        country: 'Maldives',
        location: 'Maldives',
        tag: 'Island time',
        price: 285,
        rating: 5,
        description:
            'An island-inspired stay with beach access, a swimming pool, and an outdoor terrace. Breakfast, Wi-Fi, and air conditioning are included.',
        image: 'image/destination-1.jpg',
        wifi: true,
        pool: true,
        breakfast: true,
        latitude: 4.1755,
        longitude: 73.5093,
        amenities: [
            'Complimentary Wi-Fi',
            'Swimming pool',
            'Breakfast included',
            'Beach access',
            'Outdoor terrace',
            'Air conditioning'
        ],
        photos: [
            {
                src: 'image/destination-1.jpg',
                alt: 'Illustrative tropical beach with turquoise water under a pastel sky'
            },
            {
                src: 'image/destination-8.jpg',
                alt: 'Illustrative resort courtyard with palms and a pool under a pink sky'
            },
            { src: 'image/3.jpg', alt: 'Illustrative guest bedroom with a double bed' }
        ]
    }
];

window.getSelectedHotel = function () {
    const hotelId = new URLSearchParams(window.location.search).get('hotel');
    if (!hotelId) return window.hotelsDatabase[0];
    return window.hotelsDatabase.find((hotel) => hotel.id === hotelId) || null;
};
