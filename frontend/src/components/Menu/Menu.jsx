import React, { useContext, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { StoreContext } from '../context/StoreContext'
import './Menu.css'

const Menu = () => {
    const { id } = useParams(); 
    const navigate = useNavigate();
    const { restaurant_list, addToCart } = useContext(StoreContext); 
    const [loading, setLoading] = useState(true);
    const [restaurantMenu, setRestaurantMenu] = useState([]);

    // Restaurant details find karna (Header ke liye)
    const restaurant = restaurant_list?.find(res => String(res._id) === String(id));

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                setLoading(true);
                const response = await fetch(`http://localhost:4000/api/restaurant/menu/${id}`);
                const data = await response.json();
                
                if (data.success && data.data) {
                    setRestaurantMenu(data.data);
                } else {
                    setRestaurantMenu([]);
                }
            } catch (error) {
                console.error("❌ Error fetching menu:", error);
                setRestaurantMenu([]);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchMenu();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="loader-container">
                <div className="loader"></div>
                <p>Loading menu... 🍽️</p>
            </div>
        );
    }

    return (
        <div className='menu-page'>
            {/* 1. Header Section: Aligned Like Swiggy */}
            <div className="menu-header">
                <img 
                    className='res-main-img' 
                    src={restaurant?.image || "https://via.placeholder.com/250"} 
                    alt={restaurant?.name} 
                />
                <div className="menu-header-right">
                    <h1>{restaurant ? restaurant.name : "Restaurant Menu"}</h1>
                    <p className="res-cuisine">{restaurant?.cuisine?.join(", ")}</p>
                    <p className="res-location">{restaurant?.location || "Roorkee, Uttarakhand"}</p>
                    <button onClick={() => navigate('/')} className="back-btn">← Back</button>
                </div>
            </div>

            <hr className="menu-divider" />

            {/* 2. Menu List Section */}
            <div className="food-display-list">
                {restaurantMenu && restaurantMenu.length > 0 ? (
                    restaurantMenu.map((item) => (
                        <div key={item._id} className='menu-item'>
                            
                            {/* Left Side: Text Info */}
                            <div className="menu-item-info">
                                <b>{item.name}</b>
                                <span className="price">₹{item.price}</span>
                                <p className="description">{item.description}</p>
                            </div>

                            {/* Right Side: Image + Add Button */}
                            <div className="menu-item-image-container">
                                <img 
                                    src={item.image} 
                                    alt={item.name}
                                    onError={(e) => e.target.src="https://via.placeholder.com/150?text=Dish"}
                                />
                                <button 
                                    className="add-btn" 
                                    onClick={() => addToCart(item._id)}
                                >
                                    ADD
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-menu">
                        <p>Oops! No dishes available for this restaurant.</p>
                        <small>Restaurant ID: {id}</small>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Menu;