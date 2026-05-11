import { createContext, useEffect, useState } from "react";
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

    const fetchFoodList = async () => {
        try {
            const response = await axios.get(`${url}/api/food/list`);
            if (response.data.success) {
                setFoodList(response.data.data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const fetchRestaurantList = async () => {
        try {
            const response = await axios.get(`${url}/api/restaurant/list`);
            if (response.data.success && response.data.data?.length > 0) {
                setRestaurantList(response.data.data);
                axios.get(`${url}/api/restaurant/sync-missing-menus`).then(() => fetchFoodList()).catch(() => {});
                return;
            }

            await axios.get(`${url}/api/restaurant/sync-live`, {
                params: {
                    lat: locationCoords.lat,
                    lng: locationCoords.lng
                }
            });
            const refreshed = await axios.get(`${url}/api/restaurant/list`);
            if (refreshed.data.success) {
                setRestaurantList(refreshed.data.data || []);
                // await axios.get(`${url}/api/restaurant/sync-missing-menus`).catch(() => {});
                await fetchFoodList();
            }
        } catch (error) {
            console.error(error);
            setRestaurantList([]);
        }
    };

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

    const loadData = async () => {
        await fetchFoodList();
        const storedToken = localStorage.getItem("token");
        if (storedToken) {
            if (!isValidJwt(storedToken)) {
                localStorage.removeItem("token");
                localStorage.removeItem("isLoggedIn");
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
                }
            } catch (err) {
                if (err.response?.status === 401) {
                    setToken("");
                    localStorage.removeItem("token");
                }
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