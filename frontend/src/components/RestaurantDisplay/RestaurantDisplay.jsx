import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { StoreContext } from '../context/StoreContext'
import './RestaurantDisplay.css'

const RestaurantDisplay = ({ setSelectedRestaurant }) => {
    const [searchTerm, setSearchTerm] = useState('');
    // 💡 Context se restaurant_list nikal rahe hain
    const { restaurant_list } = useContext(StoreContext);
    const navigate = useNavigate();

    // 🛡️ Safety check
    if (!restaurant_list) {
        return <div className="loader">Restaurants load ho rahe hain, sabar rakho partner... 🍕</div>;
    }

    const handleRestaurantClick = (id) => {
        if (setSelectedRestaurant) {
            setSelectedRestaurant(id);
        }
        navigate(`/menu/${id}`);
    }

    const MAX_DISPLAY_DISTANCE = 12;
    const searchLower = searchTerm.trim().toLowerCase();
    const filteredRestaurants = restaurant_list.filter((item) => {
        if (item.distance > MAX_DISPLAY_DISTANCE) return false;
        if (!searchLower) return true;
        const cuisineText = Array.isArray(item.cuisine) ? item.cuisine.join(' ') : item.cuisine || '';
        return (
            item.name?.toLowerCase().includes(searchLower) ||
            item.description?.toLowerCase().includes(searchLower) ||
            item.location?.toLowerCase().includes(searchLower) ||
            cuisineText.toLowerCase().includes(searchLower)
        );
    });

    return (
        <div className='restaurant-display' id='restaurant-display'>
            <div className="display-header">
                <h2>Top Restaurants in Roorkee</h2>
                <p>Delicious food available for delivery in your area! ✨</p>
                <div className="restaurant-search">
                    <input
                        type="text"
                        placeholder="Search restaurants, cuisines, location..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
            
            <div className='restaurant-display-list'>
                {filteredRestaurants.length > 0 ? (
                    filteredRestaurants.map((item, index) => (
                        <div 
                            key={index} 
                            className='restaurant-card'
                            onClick={() => handleRestaurantClick(item._id)} 
                        >
                            <div className="img-container">
                                <img src={item.image} alt={item.name} />
                                <div className="rating-badge">⭐ {item.rating || "4.0"}</div>
                            </div>
                            <div className="res-info">
                                <h3>{item.name}</h3>
                                <p className="cuisines">
                                    {Array.isArray(item.cuisine) ? item.cuisine.join(", ") : (item.description || "Street Food, Snacks")}
                                </p>
                                <p className="location">
                                    📍 {item.location || "Roorkee"}
                                    {item.distance > 0 && (
                                        <span className="distance"> • {item.distance} km away</span>
                                    )}
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>Oops! Koi restaurant search results mein nahi mila. Try a broader search.</p>
                )}
            </div>
        </div>
    )
}

export default RestaurantDisplay