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
    const [userRole, setUserRole] = useState(localStorage.getItem("role") || "user");
    
    const [currentLocation, setCurrentLocation] = useState("Kishanpur, Roorkee 📍");
    const [locationCoords, setLocationCoords] = useState(() => {
        const savedCoords = localStorage.getItem("savedLocationCoords");
        return savedCoords ? JSON.parse(savedCoords) : DEFAULT_COORDS;
    });

    const [orders, setOrders] = useState(() => {
        const savedOrders = localStorage.getItem("allOrders");
        return savedOrders ? JSON.parse(savedOrders) : [];
    });
    
    const [isFlashSaleActive, setIsFlashSaleActive] = useState(() => {
        return localStorage.getItem('isFlashSaleOn') === 'true';
    });
    
    const url = "http://localhost:4000"; 

    useEffect(() => {
        localStorage.setItem("allOrders", JSON.stringify(orders));
        localStorage.setItem("role", userRole); // Role ko save karna
    }, [orders, userRole]);

    const toggleFlashSale = () => {
        const newStatus = !isFlashSaleActive;
        setIsFlashSaleActive(newStatus);
        localStorage.setItem('isFlashSaleOn', newStatus);
    };

    const addOrderToAdmin = (newOrder) => {
        setOrders((prev) => [...prev, { ...newOrder, id: Date.now(), status: "Pending" }]);
    };

    const acceptOrder = (orderId) => {
        setOrders((prev) => prev.map(o => o.id === orderId ? { ...o, status: "Accepted ✅" } : o));
    };

    const fetchFoodList = useCallback(async () => {
        try {
            const response = await axios.get(`${url}/api/food/list`);
            if (response.data.success) setFoodList(response.data.data);
        } catch (error) { console.error("Error fetching food:", error); }
    }, [url]);

    const fetchRestaurantList = useCallback(async (coords) => {
        try {
            const response = await axios.get(`${url}/api/restaurant/list`);
            if (response.data.success && response.data.data?.length > 0) {
                setRestaurantList(response.data.data);
                return;
            }
            await axios.get(`${url}/api/restaurant/sync-live`, { params: { lat: coords.lat, lng: coords.lng } });
            const refreshed = await axios.get(`${url}/api/restaurant/list`);
            if (refreshed.data.success) setRestaurantList(refreshed.data.data || []);
        } catch (error) { setRestaurantList([]); }
    }, [url]);

    // --- CART LOGIC ---
    const addToCart = async (itemId) => {
        setCartItems((prev) => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
        const activeToken = token || localStorage.getItem("token");
        if (activeToken) {
            try { await axios.post(`${url}/api/cart/add`, { itemId }, { headers: { token: activeToken } }); } 
            catch (error) { console.error(error); }
        }
    };

    const removeFromCart = async (itemId) => {
        setCartItems((prev) => ({ ...prev, [itemId]: Math.max(0, (prev[itemId] || 1) - 1) }));
        const activeToken = token || localStorage.getItem("token");
        if (activeToken) {
            try { await axios.post(`${url}/api/cart/remove`, { itemId }, { headers: { token: activeToken } }); } 
            catch (error) { console.error(error); }
        }
    };

    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                let itemInfo = food_list.find((product) => product._id === item);
                if (itemInfo) totalAmount += itemInfo.price * cartItems[item];
            }
        }
        return totalAmount;
    };

    useEffect(() => {
        const loadInitialAppState = async () => {
            await fetchFoodList();
            const storedToken = localStorage.getItem("token");
            if (storedToken && isValidJwt(storedToken)) {
                setToken(storedToken);
                try {
                    const cartResponse = await axios.post(`${url}/api/cart/get`, {}, { headers: { token: storedToken } });
                    if (cartResponse.data.success) setCartItems(cartResponse.data.cartData || {});
                } catch (err) { console.error(err); }
            }
        };
        loadInitialAppState();
    }, [fetchFoodList, url]);

    useEffect(() => {
        if (locationCoords) {
            localStorage.setItem("savedLocationCoords", JSON.stringify(locationCoords));
            fetchRestaurantList(locationCoords);
        }
    }, [locationCoords, fetchRestaurantList]);

    const contextValue = {
        food_list, restaurant_list, cartItems, setCartItems, addToCart, removeFromCart, getTotalCartAmount,
        url, token, setToken, userRole, setUserRole, currentLocation, setCurrentLocation, 
        locationCoords, setLocationCoords, orders, addOrderToAdmin, acceptOrder, 
        isFlashSaleActive, toggleFlashSale
    };

    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    );
};

export default StoreContextProvider;