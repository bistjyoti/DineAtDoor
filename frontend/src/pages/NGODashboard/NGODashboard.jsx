import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import './NGODashboard.css';
import { useNavigate } from 'react-router-dom';
import { StoreContext } from '../../components/context/StoreContext';

// Testing ke liye dummy NGO ID di hai jab tak login link nahi hota
const NGODashboard = ({ ngoId = "65f1a2b3c4d5e6f7a8b9c0d9" }) => {
    const [availableDonations, setAvailableDonations] = useState([]);
    const [loading, setLoading] = useState(true);

    const { url } = useContext(StoreContext);
    const navigate = useNavigate();

    // Backend se available khana fetch karne ke liye
    const fetchDonations = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${url}/api/donations/available`);
            setAvailableDonations(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Fetch Error:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDonations();
    }, [url]);

    // Khana claim karne ka logic
    const handleClaim = async (donationId) => {
        try {
            const response = await axios.patch(`${url}/api/donations/claim/${donationId}`, {
                ngoId
            });
            alert(response.data.message || "Food claimed successfully! 🎉");
            fetchDonations();
        } catch (error) {
            console.error("Claim Error:", error);
            alert("Claim fail ho gaya, check console!");
        }
    };

    // Loading state handling
    if (loading) return <div className="loading">Khana dhoonda aa raha hai... 🍲</div>;

    return (
        <div className="ngo-dashboard">
            <button onClick={() => navigate('/')} className="back-btn">⬅ Back to Home</button>

            <h2>Available Food Donations Near You 🍲</h2>
            <p className="subtitle">Connecting surplus food with those who need it most.</p>

            {availableDonations.length === 0 ? (
                <div className="no-food">No active donations at the moment. Check back soon!</div>
            ) : (
                <div className="donation-grid">
                    {availableDonations.map((donation) => (
                        <div key={donation._id} className="donation-card">
                            <div className="restaurant-info">
                                <h4>{donation.restaurantId?.name || donation.restaurantName || "DineAtDoor Partner"}</h4>
                                <p className="address">📍 {donation.restaurantId?.location || "Nearby Location"}</p>
                            </div>
                            <hr />
                            <div className="food-details">
                                <p><strong>Items:</strong> {donation.foodItems}</p>
                                <p><strong>Quantity:</strong> {donation.quantity}</p>
                                <p className="expiry">⏳ <strong>Fresh Till:</strong> {new Date(donation.expiryTime).toLocaleString()}</p>
                            </div>
                            <button onClick={() => handleClaim(donation._id)} className="claim-btn">
                                Claim This Food
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NGODashboard;
