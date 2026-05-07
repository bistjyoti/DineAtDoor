import express from "express";
import { 
    addRestaurant, 
    listRestaurants, 
    fetchLiveRestaurants, 
    syncLiveRestaurants, // ✨ Naya controller import kiya
    fetchRestaurantMenu,
    syncAllRestaurantMenus,
    syncMissingRestaurantMenus
} from "../controllers/restaurantController.js";

const restaurantRouter = express.Router();

// 📍 Endpoint to add a new restaurant (Manual Entry)
restaurantRouter.post("/add", addRestaurant);

// 📍 Endpoint to get all restaurants from your MongoDB database
restaurantRouter.get("/list", listRestaurants);

// 📍 NEW: Swiggy Live Data Fetcher (Sirf data dekhne ke liye)
restaurantRouter.get("/fetch-live", fetchLiveRestaurants);

// 📍 Live Menu for a single restaurant
restaurantRouter.get("/menu/:id", fetchRestaurantMenu);

// 📍 ✨ MISSION CRITICAL: Sync Live Data to MongoDB
// Is URL ko hit karte hi Swiggy ka data tumhare database mein save ho jayega
restaurantRouter.get("/sync-live", syncLiveRestaurants);

// 📍 ✨ Sync ALL Restaurant Menus at Once
restaurantRouter.get("/sync-menus", syncAllRestaurantMenus);

// 📍 ✨ Generate fallback menus for restaurants with missing dishes
restaurantRouter.get("/sync-missing-menus", syncMissingRestaurantMenus);

export default restaurantRouter;