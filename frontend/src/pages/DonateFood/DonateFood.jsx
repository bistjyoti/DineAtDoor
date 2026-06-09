import React, { useState, useContext } from 'react';
import axios from 'axios';
import './DonateFood.css'; 
import { useNavigate } from 'react-router-dom';
import { StoreContext } from '../../components/context/StoreContext';

const DonateFood = ({ restaurantId = "65f1a2b3c4d5e6f7a8b9c0d1" }) => { 
    const { url } = useContext(StoreContext);
    const navigate = useNavigate();
    const [foodData, setFoodData] = useState({
        restaurantName: '',
        restaurantAddress: '',
        foodItems: '',
        quantity: '',
        expiryTime: ''
    });

    const handleChange = (e) => {
        setFoodData({ ...foodData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formattedExpiryTime = foodData.expiryTime ? new Date(foodData.expiryTime).toISOString() : '';
            
            const response = await axios.post(`${url}/api/donations/donate`, {
                ...foodData,
                expiryTime: formattedExpiryTime,
                restaurantId 
            });
            
            alert(response.data.message || "Food is donated ✅");
            
            setFoodData({ 
                restaurantName: '', 
                restaurantAddress: '', 
                foodItems: '', 
                quantity: '', 
                expiryTime: '' 
            });
        } catch (error) {
            console.error("Donation Error:", error);
            const errorMsg = error.response?.data?.message || "Connection fail!";
            alert(errorMsg);
        }
    };

    return (
        <div className="donate-container">
            <div className="donate-card">
                <h3>Surplus Food Donation </h3>
                <p className="subtitle">A small effort can fill someone's stomach.</p>
                
                <form onSubmit={handleSubmit} className="donate-form">
                    <div className="form-section">
                        <h4>🏢 Restaurant Details</h4>
                        <div className="input-group">
                            <label>Restaurant Name</label>
                            <input 
                                type="text" 
                                name="restaurantName" 
                                placeholder="Name of your restaurant (e.g. Pizza Hut)" 
                                value={foodData.restaurantName} 
                                onChange={handleChange} 
                                required 
                            />
                        </div>

                        <div className="input-group">
                            <label>Restaurant Address</label>
                            <input 
                                type="text" 
                                name="restaurantAddress" 
                                placeholder="📍Full Address (e.g. Sector 4, Roorkee)" 
                                value={foodData.restaurantAddress} 
                                onChange={handleChange} 
                                required 
                            />
                        </div>
                    </div>

                    <hr className="divider" />
                    <div className="form-section">
                        <h4>🍲 Food Details</h4>
                        <div className="input-group">
                            <label>Food Items</label>
                            <input 
                                type="text" 
                                name="foodItems" 
                                placeholder="What do you want to donate? (e.g. Rice, Dal)" 
                                value={foodData.foodItems} 
                                onChange={handleChange} 
                                required 
                            />
                        </div>

                        <div className="input-group">
                            <label>Quantity</label>
                            <input 
                                type="text" 
                                name="quantity" 
                                placeholder="How much food? (e.g. 10 plates)" 
                                value={foodData.quantity} 
                                onChange={handleChange} 
                                required 
                            />
                        </div>

                        <div className="input-group">
                            <label>Expiry Time</label>
                            <input 
                                type="datetime-local" 
                                name="expiryTime" 
                                value={foodData.expiryTime} 
                                onChange={handleChange} 
                                required 
                            />
                        </div>
                    </div>

                    <button type="submit" className="donate-btn">Post Donation </button>
                </form>
            </div>
        </div>
    );
};

export default DonateFood;