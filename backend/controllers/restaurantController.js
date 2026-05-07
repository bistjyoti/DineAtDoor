import restaurantModel from "../models/restaurantModel.js";
import axios from 'axios';
import foodModel from "../models/foodModel.js";

const DEFAULT_LAT = 29.8543;
const DEFAULT_LNG = 77.8880;
const MAX_DELIVERY_RADIUS_KM = 12;

// --- Helper Functions (Purely Preserved) ---
const getDistanceKm = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-c));
    return R * c;
};

const getRestaurantsFromSwiggyData = (data) => {
    const cards = data?.data?.cards || [];
    const matches = [];
    const collect = (node) => {
        if (!node || typeof node !== 'object') return;
        if (Array.isArray(node)) { node.forEach(collect); return; }
        if (node?.gridElements?.infoWithStyle?.restaurants) { matches.push(...node.gridElements.infoWithStyle.restaurants); }
        if (node?.restaurants) { matches.push(...node.restaurants); }
        if (node?.info && node?.info?.id && node?.info?.name) { matches.push(node); }
        Object.values(node).forEach(collect);
    };
    collect(cards);
    const unique = new Map();
    matches.forEach(item => {
        const id = item?.info?.id || item?.id;
        if (id && !unique.has(id)) unique.set(id, item);
    });
    return Array.from(unique.values());
};

const formatRestaurant = (info) => ({
    _id: info.id?.toString() || `${info.name}-${Math.random()}`,
    name: info.name || "Unknown Restaurant",
    description: Array.isArray(info.cuisines) ? info.cuisines.join(", ") : info.cuisines || info.description || "Delicious food",
    location: info.areaName || info.locality || "Roorkee",
    cuisine: info.cuisines || [],
    rating: info.avgRating || info.avgRatingString || "4.0",
    image: info.cloudinaryImageId ? `https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_660/${info.cloudinaryImageId}` : ""
});

const makeFallbackMenuForRestaurant = (restaurant) => {
    const placeholderImage = "https://via.placeholder.com/300x200?text=Dish";
    return [
        { name: 'Chef Special Platter', description: 'Favorites selection', price: 199, category: 'Chef Special', image: placeholderImage, restaurantId: restaurant._id },
        { name: 'Mango Lassi', description: 'Creamy yogurt drink', price: 89, category: 'Beverages', image: placeholderImage, restaurantId: restaurant._id }
    ];
};

// --- Main Controller Functions ---

const addRestaurant = async (req, res) => {
    try {
        const newRestaurant = new restaurantModel(req.body);
        await newRestaurant.save();
        res.json({ success: true, message: "Restaurant Added Successfully ✅" });
    } catch (error) { res.json({ success: false, message: "Error adding restaurant ❌" }); }
};

const listRestaurants = async (req, res) => {
    try {
        const restaurants = await restaurantModel.find({});
        res.json({ success: true, data: restaurants });
    } catch (error) { res.json({ success: false, message: "Error fetching data ❌" }); }
};

const fetchLiveRestaurants = async (req, res) => {
    try {
        const userLat = parseFloat(req.query.lat) || DEFAULT_LAT;
        const userLng = parseFloat(req.query.lng) || DEFAULT_LNG;
        const locations = [
            { name: 'Roorkee Center', lat: 29.8543, lng: 77.8880 },
            { name: 'Roorkee IIT', lat: 29.8646, lng: 77.8964 },
            { name: 'Roorkee Civil Lines', lat: 29.8667, lng: 77.8917 }
        ];

        const allRestaurants = [];
        for (const loc of locations) {
            const swiggyUrl = `https://www.swiggy.com/dapi/restaurants/list/v5?lat=${loc.lat}&lng=${loc.lng}&is-seo-homepage-enabled=true&page_type=DESKTOP_WEB_LISTING`;
            const response = await axios.get(swiggyUrl, { headers: { 'User-Agent': 'Mozilla/5.0...' } });
            const found = getRestaurantsFromSwiggyData(response.data);
            allRestaurants.push(...found);
        }

        const unique = Array.from(new Map(allRestaurants.map(r => [r.info?.id || r.id, r])).values());
        const formatted = unique.map(res => formatRestaurant(res.info || res));
        res.json({ success: true, data: formatted });
    } catch (error) { res.json({ success: false, message: "Live data fetch nahi ho paya!" }); }
};

const syncLiveRestaurants = async (req, res) => {
    try {
        const lat = parseFloat(req.query.lat) || DEFAULT_LAT;
        const lng = parseFloat(req.query.lng) || DEFAULT_LNG;
        const swiggyUrl = `https://www.swiggy.com/dapi/restaurants/list/v5?lat=${lat}&lng=${lng}&is-seo-homepage-enabled=true&page_type=DESKTOP_WEB_LISTING`;
        const response = await axios.get(swiggyUrl, { headers: { 'User-Agent': 'Mozilla/5.0...' } });
        const restaurants = getRestaurantsFromSwiggyData(response.data);

        for (let item of restaurants) {
            const info = item.info || item;
            await restaurantModel.findOneAndUpdate(
                { name: info.name },
                { ...formatRestaurant(info), swiggyId: info.id?.toString(), lat, lng },
                { upsert: true, new: true }
            );
        }
        res.json({ success: true, message: `${restaurants.length} Restaurants Synced! 🏠✨` });
    } catch (error) { res.json({ success: false, message: "Sync fail ho gaya boss!" }); }
};

// 🥘 IMPROVED: Menu extraction logic merged into your structure
const fetchRestaurantMenu = async (req, res) => {
    try {
        const { id } = req.params;
        const restaurant = await restaurantModel.findById(id);
        if (!restaurant) return res.json({ success: false, message: 'Restaurant not found' });

        const existingDishes = await foodModel.find({ restaurantId: id });
        if (existingDishes.length > 0) return res.json({ success: true, data: existingDishes });

        let restaurantMenu = [];
        if (restaurant.swiggyId) {
            try {
                const menuUrl = `https://www.swiggy.com/dapi/menu/pl?page-type=REGULAR_MENU&lat=${restaurant.lat || DEFAULT_LAT}&lng=${restaurant.lng || DEFAULT_LNG}&restaurantId=${restaurant.swiggyId}`;
                const response = await axios.get(menuUrl, { headers: { 'User-Agent': 'Mozilla/5.0...' } });
                
                const cards = response.data?.data?.cards?.find(c => c.groupedCard)?.groupedCard?.cardGroupMap?.REGULAR?.cards || [];
                
                cards.forEach(card => {
                    const section = card.card?.card;
                    if (!section) return;

                    const processItems = (items, catName) => {
                        items.forEach(itemCard => {
                            const info = itemCard.card?.info;
                            if (info) {
                                restaurantMenu.push({
                                    name: info.name,
                                    description: info.description || "",
                                    price: (info.price || info.defaultPrice || 0) / 100,
                                    image: info.imageId ? `https://media-assets.swiggy.com/swiggy/image/upload/${info.imageId}` : "",
                                    category: catName,
                                    restaurantId: id
                                });
                            }
                        });
                    };

                    if (section.itemCards) processItems(section.itemCards, section.title || "Menu");
                    if (section.categories) section.categories.forEach(sub => processItems(sub.itemCards || [], sub.title || section.title));
                });
            } catch (e) { console.log("Swiggy menu failed, using fallback"); }
        }

        if (restaurantMenu.length === 0) restaurantMenu = makeFallbackMenuForRestaurant(restaurant);

        for (const dish of restaurantMenu) {
            await foodModel.findOneAndUpdate({ name: dish.name, restaurantId: id }, dish, { upsert: true });
        }
        res.json({ success: true, data: restaurantMenu });
    } catch (error) { res.json({ success: false, message: 'Menu fetch error' }); }
};

const syncAllRestaurantMenus = async (req, res) => {
    try {
        const restaurants = await restaurantModel.find({});
        let total = 0;
        for (const resObj of restaurants) {
            // Re-using the logic within a loop for bulk sync
            const mockReq = { params: { id: resObj._id } };
            const mockRes = { json: (data) => { if(data.success) total += (data.data?.length || 0) } };
            await fetchRestaurantMenu(mockReq, mockRes);
            await new Promise(r => setTimeout(r, 1000));
        }
        res.json({ success: true, message: `${total} Dishes Synced Globally! 🍽️✨` });
    } catch (error) { res.json({ success: false, message: "Bulk sync fail" }); }
};

const syncMissingRestaurantMenus = async (req, res) => {
    try {
        const restaurants = await restaurantModel.find({});
        for (const r of restaurants) {
            const count = await foodModel.countDocuments({ restaurantId: r._id });
            if (count === 0) {
                const fallback = makeFallbackMenuForRestaurant(r);
                for (const d of fallback) await foodModel.findOneAndUpdate({ name: d.name, restaurantId: r._id }, d, { upsert: true });
            }
        }
        res.json({ success: true, message: "Missing menus filled!" });
    } catch (error) { res.json({ success: false, message: "Missing sync failed" }); }
};

export { addRestaurant, listRestaurants, fetchLiveRestaurants, syncLiveRestaurants, fetchRestaurantMenu, syncAllRestaurantMenus, syncMissingRestaurantMenus };