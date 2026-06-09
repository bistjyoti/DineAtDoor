import axios from 'axios';
import foodModel from './../models/foodModel.js';

const SWIGGY_BASE_URL = 'https://www.swiggy.com/api/v2';
const SWIGGY_API_KEY = process.env.SWIGGY_API_KEY || '';


const restaurantCache = new Map();
const CACHE_DURATION = 3600000; 


const getRestaurantsByLocation = async (req, res) => {
    try {
        const { latitude, longitude, offset = 0 } = req.query;
        
        if (!latitude || !longitude) {
            return res.json({ success: false, message: 'Location coordinates required' });
        }

        const cacheKey = `restaurants_${latitude}_${longitude}`;
        if (restaurantCache.has(cacheKey)) {
            const cached = restaurantCache.get(cacheKey);
            if (Date.now() - cached.timestamp < CACHE_DURATION) {
                return res.json({ success: true, data: cached.data });
            }
        }

        const response = await axios.get(`${SWIGGY_BASE_URL}/restaurants`, {
            params: {
                lat: latitude,
                lng: longitude,
                offset: offset || 0
            },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json'
            },
            timeout: 10000
        });

        let restaurants = [];

       
        if (response.data) {
            if (Array.isArray(response.data)) {
                restaurants = parseRestaurantsFromArray(response.data);
            } else if (response.data.restaurants) {
                restaurants = parseRestaurants(response.data.restaurants);
            } else if (response.data.data) {
                restaurants = parseRestaurants(response.data.data);
            }
        }


        const formattedRestaurants = restaurants.map(r => ({
            id: r.id,
            name: r.name,
            cuisines: r.cuisines || [],
            rating: r.rating || 0,
            deliveryTime: r.deliveryTime || 30,
            deliveryFee: r.deliveryFee || 0,
            image: r.image || r.imageUrl,
            isOpen: r.isOpen !== false,
            offersDeals: r.offersDeals || false,
            totalRatings: r.totalRatings || 0,
            address: r.address || '',
            locality: r.locality || '',
            cloudinaryImageId: r.cloudinaryImageId || ''
        })).filter(r => r.isOpen);

        restaurantCache.set(cacheKey, {
            data: formattedRestaurants,
            timestamp: Date.now()
        });

        res.json({ success: true, data: formattedRestaurants });
    } catch (error) {
        console.log('Error fetching restaurants:', error.message);
        res.json({ success: false, message: 'Error fetching restaurants from Swiggy' });
    }
};


const getRestaurantMenu = async (req, res) => {
    try {
        const { restaurantId } = req.params;
        
        if (!restaurantId) {
            return res.json({ success: false, message: 'Restaurant ID required' });
        }

       
        const response = await axios.get(`${SWIGGY_BASE_URL}/restaurants/${restaurantId}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json'
            },
            timeout: 10000
        });

        const dishes = parseDishesFromResponse(response.data);

        res.json({ success: true, data: dishes });
    } catch (error) {
        console.log('Error fetching restaurant menu:', error.message);
        res.json({ success: false, message: 'Error fetching restaurant menu' });
    }
};


const getAllRestaurantDishes = async (req, res) => {
    try {
        const { latitude, longitude } = req.query;
        
        if (!latitude || !longitude) {
            return res.json({ success: false, message: 'Location coordinates required' });
        }

     
        const restaurantsResponse = await axios.get(`${SWIGGY_BASE_URL}/restaurants`, {
            params: {
                lat: latitude,
                lng: longitude
            },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 10000
        });

        let restaurants = [];
        if (restaurantsResponse.data?.restaurants) {
            restaurants = parseRestaurants(restaurantsResponse.data.restaurants);
        } else if (Array.isArray(restaurantsResponse.data)) {
            restaurants = parseRestaurantsFromArray(restaurantsResponse.data);
        }


        const restaurantDishes = [];
        
        for (const restaurant of restaurants.slice(0, 10)) { 
            try {
                const menuResponse = await axios.get(`${SWIGGY_BASE_URL}/restaurants/${restaurant.id}`, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    },
                    timeout: 5000
                });

                const dishes = parseDishesFromResponse(menuResponse.data);
                
                restaurantDishes.push({
                    restaurant: {
                        id: restaurant.id,
                        name: restaurant.name,
                        cuisines: restaurant.cuisines,
                        rating: restaurant.rating,
                        image: restaurant.image
                    },
                    dishes: dishes
                });
            } catch (err) {
                console.log(`Error fetching menu for restaurant ${restaurant.name}:`, err.message);
            }
        }

        res.json({ success: true, data: restaurantDishes });
    } catch (error) {
        console.log('Error fetching all dishes:', error.message);
        res.json({ success: false, message: 'Error fetching restaurant dishes' });
    }
};


const syncRestaurantsToDB = async (req, res) => {
    try {
        const { restaurants } = req.body;
        
        if (!restaurants || !Array.isArray(restaurants)) {
            return res.json({ success: false, message: 'Invalid restaurant data' });
        }

        let syncedCount = 0;

        for (const restaurant of restaurants) {
            for (const dish of restaurant.dishes || []) {
                try {
                    const existingFood = await foodModel.findOne({ 
                        swigyId: dish.id 
                    });

                    if (!existingFood) {
                        const newFood = new foodModel({
                            name: dish.name,
                            description: dish.description || 'N/A',
                            price: dish.price || 0,
                            category: dish.category || 'Others',
                            veg: dish.veg !== false,
                            rating: dish.rating || 0,
                            prepTime: dish.prepTime || 30,
                            image: dish.image || '',
                            swigyId: dish.id,
                            restaurantId: restaurant.id,
                            restaurantName: restaurant.name
                        });
                        await newFood.save();
                        syncedCount++;
                    }
                } catch (err) {
                    console.log('Error syncing dish:', err);
                }
            }
        }

        res.json({ success: true, message: `Synced ${syncedCount} new dishes to database` });
    } catch (error) {
        console.log('Error syncing restaurants:', error);
        res.json({ success: false, message: 'Error syncing restaurant data' });
    }
};


const getPopularDishes = async (req, res) => {
    try {
        const { latitude, longitude, limit = 20 } = req.query;
        
        if (!latitude || !longitude) {
            return res.json({ success: false, message: 'Location coordinates required' });
        }

        
        const restaurantsResponse = await axios.get(`${SWIGGY_BASE_URL}/restaurants`, {
            params: {
                lat: latitude,
                lng: longitude
            },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 10000
        });

        let restaurants = [];
        if (restaurantsResponse.data?.restaurants) {
            restaurants = parseRestaurants(restaurantsResponse.data.restaurants);
        }

        const allDishes = [];


        for (const restaurant of restaurants.slice(0, 5)) {
            try {
                const menuResponse = await axios.get(`${SWIGGY_BASE_URL}/restaurants/${restaurant.id}`, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    },
                    timeout: 5000
                });

                const dishes = parseDishesFromResponse(menuResponse.data);
                allDishes.push(...dishes.map(d => ({
                    ...d,
                    restaurantId: restaurant.id,
                    restaurantName: restaurant.name,
                    restaurantRating: restaurant.rating
                })));
            } catch (err) {
                console.log(`Error fetching menu:`, err.message);
            }
        }

       
        const popularDishes = allDishes
            .sort((a, b) => (b.rating || 0) - (a.rating || 0))
            .slice(0, parseInt(limit));

        res.json({ success: true, data: popularDishes });
    } catch (error) {
        console.log('Error fetching popular dishes:', error.message);
        res.json({ success: false, message: 'Error fetching popular dishes' });
    }
};


const searchDishes = async (req, res) => {
    try {
        const { query, latitude, longitude } = req.query;
        
        if (!query || !latitude || !longitude) {
            return res.json({ success: false, message: 'Search query and location required' });
        }

        const response = await axios.get(`${SWIGGY_BASE_URL}/restaurants`, {
            params: {
                lat: latitude,
                lng: longitude
            },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 10000
        });

        let restaurants = [];
        if (response.data?.restaurants) {
            restaurants = parseRestaurants(response.data.restaurants);
        }

        const searchResults = [];
        const queryLower = query.toLowerCase();

        for (const restaurant of restaurants.slice(0, 8)) {
            try {
                const menuResponse = await axios.get(`${SWIGGY_BASE_URL}/restaurants/${restaurant.id}`, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    },
                    timeout: 5000
                });

                const dishes = parseDishesFromResponse(menuResponse.data);
                const matchingDishes = dishes.filter(d =>
                    d.name.toLowerCase().includes(queryLower) ||
                    d.description?.toLowerCase().includes(queryLower) ||
                    d.category?.toLowerCase().includes(queryLower)
                );

                if (matchingDishes.length > 0) {
                    searchResults.push({
                        restaurant: {
                            id: restaurant.id,
                            name: restaurant.name,
                            rating: restaurant.rating
                        },
                        dishes: matchingDishes
                    });
                }
            } catch (err) {
                console.log('Error searching:', err.message);
            }
        }

        res.json({ success: true, data: searchResults });
    } catch (error) {
        console.log('Error searching dishes:', error.message);
        res.json({ success: false, message: 'Error searching dishes' });
    }
};


const parseRestaurants = (restaurantsArray) => {
    return restaurantsArray.map(r => {
        const restaurantData = r.restaurant || r;
        return {
            id: restaurantData.id || restaurantData.restaurantId,
            name: restaurantData.name,
            cuisines: restaurantData.cuisines || [],
            rating: restaurantData.avgRating || restaurantData.rating || 0,
            deliveryTime: restaurantData.deliveryTime || 30,
            deliveryFee: restaurantData.deliveryFee || 0,
            image: restaurantData.cloudinaryImageId || restaurantData.image || '',
            isOpen: restaurantData.isOpen !== false,
            address: restaurantData.address || '',
            locality: restaurantData.locality || '',
            totalRatings: restaurantData.ratingCountAlt || restaurantData.totalRatings || 0
        };
    }).filter(r => r.name && r.id);
};

const parseRestaurantsFromArray = (array) => {
    return array.filter(item => item.restaurant).map(item => {
        const r = item.restaurant;
        return {
            id: r.id,
            name: r.name,
            cuisines: r.cuisines || [],
            rating: r.avgRating || 0,
            deliveryTime: r.deliveryTime || 30,
            deliveryFee: r.deliveryFee || 0,
            image: r.cloudinaryImageId || '',
            isOpen: r.isOpen !== false,
            address: r.address || '',
            locality: r.locality || '',
            totalRatings: r.ratingCountAlt || 0
        };
    }).filter(r => r.id);
};

const parseDishesFromResponse = (apiResponse) => {
    const dishes = [];

    try {
        if (!apiResponse) return dishes;

        
        const menuItems = apiResponse.items || apiResponse.dishes || apiResponse.menu || [];

        return menuItems.map(item => {
            const itemData = item.item || item;
            return {
                id: itemData.id || itemData.dishId || Math.random().toString(36).substr(2, 9),
                name: itemData.name || 'Unknown',
                description: itemData.description || '',
                price: itemData.price || itemData.defaultPrice || 0,
                category: itemData.category || 'Others',
                veg: itemData.isVeg === 1 || itemData.veg !== false,
                rating: itemData.avgRating || itemData.rating || 0,
                image: itemData.cloudinaryImageId || itemData.image || '',
                prepTime: itemData.preparationTime || itemData.prepTime || 30,
                totalRatings: itemData.ratingCountAlt || itemData.totalRatings || 0,
                availability: itemData.availability !== false,
                offers: itemData.offers || []
            };
        }).filter(d => d.availability !== false);
    } catch (error) {
        console.log('Error parsing dishes:', error);
    }

    return dishes;
};

export { 
    getRestaurantsByLocation, 
    getRestaurantMenu, 
    getAllRestaurantDishes, 
    getPopularDishes,
    searchDishes,
    syncRestaurantsToDB 
};
