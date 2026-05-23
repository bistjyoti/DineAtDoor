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
swiggyRouter.get('/restaurants', getRestaurantsByLocation);
swiggyRouter.get('/restaurant/:restaurantId/menu', getRestaurantMenu);
swiggyRouter.get('/dishes/all', getAllRestaurantDishes);
swiggyRouter.get('/dishes/popular', getPopularDishes);
swiggyRouter.get('/dishes/search', searchDishes);
swiggyRouter.post('/sync', syncRestaurantsToDB);

export default swiggyRouter;
