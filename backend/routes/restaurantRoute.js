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
restaurantRouter.post("/add", addRestaurant);
restaurantRouter.get("/list", listRestaurants);
restaurantRouter.get("/fetch-live", fetchLiveRestaurants);
restaurantRouter.get("/menu/:id", fetchRestaurantMenu);
restaurantRouter.get("/sync-menus", syncAllRestaurantMenus);
restaurantRouter.get("/sync-missing-menus", syncMissingRestaurantMenus);

export default restaurantRouter;