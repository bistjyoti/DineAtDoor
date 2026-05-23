import { createContext, useEffect, useState, useCallback } from "react";
import axios from "axios";

export const StoreContext = createContext(null);

const isValidJwt = (token) => {
    return typeof token === 'string' && token.split('.').length === 3 && token !== 'undefined' && token !== 'null';
};

const DEFAULT_COORDS = { lat: 29.8543, lng: 77.8880 };

const StoreContextProvider = (props) => {
    const [food_list, setFoodList] = useState([]); 
    const [restaurant_list, setRestaurantList] = useState([]);
    const [cartItems, setCartItems] = useState({});
    const [token, setToken] = useState("");
    const [locationCoords, setLocationCoords] = useState(() => {
        const savedCoords = localStorage.getItem("savedLocationCoords");
        return savedCoords ? JSON.parse(savedCoords) : DEFAULT_COORDS;
    });
    const url = "http://localhost:4000"; 
    const [currentLocation, setCurrentLocation] = useState("Kishanpur, Roorkee 📍");

    // 💡 Fetch Food List Definition
    const fetchFoodList = useCallback(async () => {
        try {
            const response = await axios.get(`${url}/api/food/list`);
            if (response.data.success) {
                setFoodList(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching food list:", error);
        }
    }, [url]);

    // 💡 Fetch Restaurant List - Loop Protected
    const fetchRestaurantList = useCallback(async (coords) => {
        try {
            const response = await axios.get(`${url}/api/restaurant/list`);
            if (response.data.success && response.data.data?.length > 0) {
                setRestaurantList(response.data.data);
                return; // Guard statement to prevent loop executions
            }

            await axios.get(`${url}/api/restaurant/sync-live`, {
                params: { lat: coords.lat, lng: coords.lng }
            });
            
            const refreshed = await axios.get(`${url}/api/restaurant/list`);
            if (refreshed.data.success) {
                setRestaurantList(refreshed.data.data || []);
            }
        } catch (error) {
            console.error("Error fetching restaurant list:", error);
            setRestaurantList([]);
        }
    }, [url]);

    // 🔥 FIX: Standardized cleaner header authorization matching backend rules
    const addToCart = async (itemId) => {
        setCartItems((prev) => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
        
        const activeToken = token || localStorage.getItem("token");
        if (activeToken) {
            try {
                await axios.post(
                    `${url}/api/cart/add`,
                    { itemId },
                    { headers: { token: activeToken } } // Pass token natively without Bearer breaks
                );
            } catch (error) {
                console.error("Error adding to server cart layout:", error);
            }
        }
    };

    const removeFromCart = async (itemId) => {
        setCartItems((prev) => ({ ...prev, [itemId]: Math.max(0, (prev[itemId] || 1) - 1) }));
        
        const activeToken = token || localStorage.getItem("token");
        if (activeToken) {
            try {
                await axios.post(
                    `${url}/api/cart/remove`,
                    { itemId },
                    { headers: { token: activeToken } }
                );
            } catch (error) {
                console.error("Error removing from server cart context:", error);
            }
        }
    };

    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                let itemInfo = food_list.find((product) => product._id === item);
                if (itemInfo) {
                    totalAmount += itemInfo.price * cartItems[item];
                }
            }
        }
        return totalAmount;
    };

    // 🛡️ Safe Main Data Pipeline Hydration Effect
    useEffect(() => {
        const loadInitialAppState = async () => {
            await fetchFoodList();
            
            const storedToken = localStorage.getItem("token");
            if (storedToken && isValidJwt(storedToken)) {
                setToken(storedToken);
                try {
                    const cartResponse = await axios.post(
                        `${url}/api/cart/get`,
                        {},
                        { headers: { token: storedToken } }
                    );
                    if (cartResponse.data.success) {
                        setCartItems(cartResponse.data.cartData || {});
                    }
                } catch (err) {
                    console.error("Silent authentication cart sync log:", err.message);
                    // Avoid auto logouts inside unstable networks
                }
            }
        };

        loadInitialAppState();
    }, [fetchFoodList, url]);

    // 🛰️ Strict Location Dependency Tracker Effect - Thread Separated
    useEffect(() => {
        if (locationCoords) {
            localStorage.setItem("savedLocationCoords", JSON.stringify(locationCoords));
            fetchRestaurantList(locationCoords);
        }
    }, [locationCoords, fetchRestaurantList]);

    const contextValue = {
        food_list,
        restaurant_list,
        cartItems,
        setCartItems,
        addToCart,
        removeFromCart,
        getTotalCartAmount,
        url,
        token,
        setToken,
        currentLocation,
        setCurrentLocation,
        locationCoords,
        setLocationCoords
    };

    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    );
};

export default StoreContextProvider;