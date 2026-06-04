import React, { useState, useContext } from 'react';
import axios from 'axios';
import './DonateFood.css';
import { StoreContext } from '../../components/context/StoreContext';

// Testing ke liye default restaurantId zaroor rakhna, warna MongoDB error dega
const DonateFood = ({ restaurantId = "65f1a2b3c4d5e6f7a8b9c0d1" }) => {
    const { url } = useContext(StoreContext);
    const [foodData, setFoodData] = useState({
        foodItems: '',
        quantity: '',
        expiryTime: '',
        restaurantName: ''
    });

    const handleChange = (e) => {
        setFoodData({ ...foodData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${url}/api/donations/donate`, {
                ...foodData,
                restaurantId
            });

            alert(response.data.message || "Khana donate ho gaya! ✅");

            // Form reset
            setFoodData({ foodItems: '', quantity: '', expiryTime: '', restaurantName: '' });
        } catch (error) {
            console.error("Donation Error:", error);
            const errorMsg = error.response?.data?.error || "Connection fail! Console dekho.";
            alert(errorMsg);
        }
    };

    return (
        <div className="donate-container">
            <div className="donate-card">
                <h3>Surplus Food Donation 🍲</h3>
                <p>Ek choti si koshish, kisi ka pet bhar sakti hai.</p>

                <form onSubmit={handleSubmit} className="donate-form">
                    <div className="input-group">
                        <label>Restaurant Name</label>
                        <input
                            type="text"
                            name="restaurantName"
                            placeholder="Apne restaurant ka naam likhein"
                            value={foodData.restaurantName}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Food Items</label>
                        <input
                            type="text"
                            name="foodItems"
                            placeholder="Kya donate kar rahe hain? (e.g. Rice, Dal)"
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
                            placeholder="Kitna khana hai? (e.g. 5kg, 10 plates)"
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

                    <button type="submit" className="donate-btn">Post Donation</button>
                </form>
            </div>
        </div>
    );
};

export default DonateFood;
