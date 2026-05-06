import express from 'express';
import { 
    getRestaurantsByLocation, 
    getRestaurantMenu, 
    getAllRestaurantDishes, 
    getPopularDishes,
    searchDishes,
    syncRestaurantsToDB 
} from './../controllers/swiggyIntegrationController.js';

const swiggyRouter = express.Router();

// Get nearby restaurants by location coordinates
swiggyRouter.get('/restaurants', getRestaurantsByLocation);

// Get specific restaurant menu with all dishes
swiggyRouter.get('/restaurant/:restaurantId/menu', getRestaurantMenu);

// Get all dishes from all available restaurants in the area
swiggyRouter.get('/dishes/all', getAllRestaurantDishes);

// Get popular/trending dishes
swiggyRouter.get('/dishes/popular', getPopularDishes);

// Search dishes by name across all restaurants
swiggyRouter.get('/dishes/search', searchDishes);

// Sync restaurants and dishes to local database
swiggyRouter.post('/sync', syncRestaurantsToDB);

export default swiggyRouter;
