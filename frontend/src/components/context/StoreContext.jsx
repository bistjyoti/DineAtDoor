import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const StoreContext = createContext(null);

const isValidJwt = (token) => {
    return typeof token === 'string' && token.split('.').length === 3 && token !== 'undefined' && token !== 'null';
};

const DEFAULT_COORDS = { lat: 29.8543, lng: 77.8880 };

const StoreContextProvider = (props) => {
    const [food_list, setFoodList] = useState([]); 
    const [restaurant_list, setRestaurantList] = useState([]); // ✨ Naya state restaurants ke liye
    const [cartItems, setCartItems] = useState({});
    const [token, setToken] = useState("");
    const [locationCoords, setLocationCoords] = useState(() => {
        const savedCoords = localStorage.getItem("savedLocationCoords");
        return savedCoords ? JSON.parse(savedCoords) : DEFAULT_COORDS;
    });
    const url = "http://localhost:4000"; 
    const [currentLocation, setCurrentLocation] = useState("Kishanpur, Roorkee 📍");

    // 🎯 1. Backend se Food Items fetch karna
    const fetchFoodList = async () => {
        try {
            const response = await axios.get(`${url}/api/food/list`);
            if (response.data.success) {
                setFoodList(response.data.data);
            }
        } catch (error) {
            console.error("❌ Food fetch error:", error);
        }
    };

    // 🎯 2. Backend se Restaurants fetch karna (Live Swiggy Data)
    const fetchRestaurantList = async () => {
        try {
            const response = await axios.get(`${url}/api/restaurant/fetch-live`, {
                params: {
                    lat: locationCoords.lat,
                    lng: locationCoords.lng
                }
            });
            if (response.data.success) {
                setRestaurantList(response.data.data); // Live restaurant data yahan aayega
                return;
            }
        } catch (error) {
            console.error("❌ Live restaurant fetch error:", error);
        }

        // Fallback: agar live data fail ho jaye toh local DB se load kar do
        try {
            const response = await axios.get(`${url}/api/restaurant/list`);
            if (response.data.success) {
                setRestaurantList(response.data.data);
            }
        } catch (error) {
            console.error("❌ Restaurant fetch fallback error:", error);
        }
    };

    // 🎯 3. Cart Logic
    const addToCart = async (itemId) => {
        if (!cartItems[itemId]) {
            setCartItems((prev) => ({ ...prev, [itemId]: 1 }));
        } else {
            setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
        }
        if (token) {
            await axios.post(
                `${url}/api/cart/add`,
                { itemId },
                { headers: { authorization: `Bearer ${token}` } }
            );
        }
    };

    const removeFromCart = async (itemId) => {
        setCartItems((prev) => ({ ...prev, [itemId]: Math.max(0, prev[itemId] - 1) }));
        if (token) {
            await axios.post(
                `${url}/api/cart/remove`,
                { itemId },
                { headers: { authorization: `Bearer ${token}` } }
            );
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

    // 🎯 4. Load Data (Saare components ready hone par call hoga)
    const loadData = async () => {
        await fetchFoodList();
        
        const storedToken = localStorage.getItem("token");
        if (storedToken) {
            if (!isValidJwt(storedToken)) {
                localStorage.removeItem("token");
                setToken("");
                return;
            }

            setToken(storedToken);
            try {
                const cartResponse = await axios.post(
                    `${url}/api/cart/get`,
                    {},
                    { headers: { authorization: `Bearer ${storedToken}` } }
                );
                if (cartResponse.data.success) {
                    setCartItems(cartResponse.data.cartData);
                } else {
                    localStorage.removeItem("token");
                    setToken("");
                }
            } catch (err) {
                if (err.response?.status === 401) {
                    localStorage.removeItem("token");
                    setToken("");
                }
                console.error("❌ Cart auth error:", err.response?.data || err.message || err);
            }
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        localStorage.setItem("savedLocationCoords", JSON.stringify(locationCoords));
        fetchRestaurantList();
    }, [locationCoords]);

    const contextValue = {
        food_list,
        restaurant_list, // ✨ Ab ye bhi accessible hai pure app mein
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