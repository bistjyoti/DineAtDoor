import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import './NGODashboard.css';
import { useNavigate } from 'react-router-dom';
import { StoreContext } from '../../components/context/StoreContext';

const NGODashboard = ({ ngoId = "65f1a2b3c4d5e6f7a8b9c0d9" }) => {
    const [availableDonations, setAvailableDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    const { url } = useContext(StoreContext); 
    const navigate = useNavigate(); 
    const fetchDonations = async (showLoading = false) => {
        try {
            if (showLoading) setLoading(true);
            const response = await axios.get(`${url}/api/donations/list`); 
            
            console.log("Juhiee's Raw Data:", response.data);

            if (response.data && response.data.success) {
                setAvailableDonations(response.data.data || []);
            } else {
                setAvailableDonations([]);
            }
            setLoading(false);
        } catch (error) {
            console.error("Fetch Error:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (url) {
            fetchDonations(true); 

            const pollInterval = setInterval(() => {
                fetchDonations(false); 
            }, 5000);

            return () => clearInterval(pollInterval); 
        }
    }, [url]);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000); 

        return () => clearInterval(timer);
    }, []);

    const handleClaim = async (donationId) => {
        try {
            const response = await axios.patch(`${url}/api/donations/claim/${donationId}`, {
                ngoId
            });
            alert(response.data.message || "Food claimed successfully! 🎉");
            fetchDonations(false);
        } catch (error) {
            console.error("Claim Error:", error);
            alert("Claim failed !");
        }
    };

    const liveActiveDonations = availableDonations.filter((donation) => {
        return new Date(donation.expiryTime) > currentTime;
    });

    if (loading) return <div className="loading">Searching food for those in need... 🍲</div>;

    return (
        <div className="ngo-dashboard">
            <div className="dashboard-actions" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <button onClick={() => navigate('/')} className="back-btn">⬅ Back to Home</button>
                <button onClick={() => navigate('/ngo-history')} className="history-btn" style={{ background: '#2ecc71', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>View Claim History 📜</button>
            </div>
            
            <h2>Available Food Donations Near You 🍲</h2>
            <p className="subtitle">Connecting surplus food with those who need it most.</p>
          
            {liveActiveDonations.length === 0 ? (
                <div className="no-food">No active donations at the moment. Check back soon!</div>
            ) : (
                <div className="donation-grid">
                    {liveActiveDonations.map((donation) => (
                        <div key={donation._id} className="donation-card">
                            <div className="restaurant-info">
                                <h4>{donation.restaurantName || donation.restaurantId?.name || "DineAtDoor Partner"}</h4>
                                <p className="address">
                                    📍 {donation.restaurantAddress || donation.restaurantId?.location || donation.restaurantId?.address || "Address details on claim"}
                                </p>
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