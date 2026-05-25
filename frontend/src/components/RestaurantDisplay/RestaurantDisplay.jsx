import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { StoreContext } from '../context/StoreContext'
import './RestaurantDisplay.css'

const RestaurantDisplay = ({ setSelectedRestaurant }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const { restaurant_list } = useContext(StoreContext);
    const navigate = useNavigate();

    if (!restaurant_list || restaurant_list.length === 0) {
        return (
            <div className="loader-container">
                <div className="loader"></div>
                <p>Finding the best restaurants for you... </p>
            </div>
        );
    }

    const handleRestaurantClick = (id) => {
        if (!id) return; 
        
        if (setSelectedRestaurant) {
            setSelectedRestaurant(id);
        }
        
        navigate(`/menu/${id}`);
    }

    
    const MAX_DISTANCE = 15; 
    const searchLower = searchTerm.trim().toLowerCase();

    const filteredRestaurants = restaurant_list.filter((item) => {
        const isNearby = item.distance ? item.distance <= MAX_DISTANCE : true;
        
        if (!isNearby) return false;
        if (!searchLower) return true;

        const cuisineStr = Array.isArray(item.cuisine) ? item.cuisine.join(' ') : (item.cuisine || '');
        
        return (
            item.name?.toLowerCase().includes(searchLower) ||
            item.location?.toLowerCase().includes(searchLower) ||
            cuisineStr.toLowerCase().includes(searchLower)
        );
    });

    return (
        <div className='restaurant-display' id='restaurant-display'>
            <div className="display-header">
                <div className="header-text">
                    <h2>Top Restaurants in Roorkee</h2>
                    <p>Order from your favorite local spots!</p>
                </div>
                <div className="restaurant-search">
                    <input
                        type="text"
                        placeholder="Search for pizza, biryani, or restaurants..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
            
            <div className='restaurant-display-list'>
                {filteredRestaurants.length > 0 ? (
                    filteredRestaurants.map((item, index) => (
                        <div 
                            key={item._id || index} 
                            className='restaurant-card'
                            onClick={() => handleRestaurantClick(item._id)} 
                        >
                            <div className="img-container">
                                <img 
                                    src={item.image || "https://via.placeholder.com/300x200?text=Delicious+Food"} 
                                    alt={item.name} 
                                    onError={(e) => { 
                                        e.target.onerror = null; 
                                        e.target.src="https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_660/e0vvp5vebill0idwt874"; 
                                    }}
                                />
                                <div className="rating-badge">⭐ {item.rating || "4.0"}</div>
                            </div>

                            <div className="res-info">
                                <div className="res-name-row">
                                    <h3>{item.name}</h3>
                                </div>
                                <p className="cuisines">
                                    {Array.isArray(item.cuisine) && item.cuisine.length > 0 
                                        ? item.cuisine.slice(0, 3).join(", ") 
                                        : (item.description?.substring(0, 30) || "Fast Food, North Indian")}
                                </p>
                                <div className="res-footer">
                                    <span className="location">📍 {item.location || "Roorkee"}</span>
                                    {item.distance !== undefined && (
                                        <span className="distance-tag">{item.distance} km</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-results">
                        <p>Oops!No restaurants available with this name. Search for another one..</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default RestaurantDisplay;