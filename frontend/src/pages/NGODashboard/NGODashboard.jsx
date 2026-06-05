import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import './NGODashboard.css';
import { useNavigate } from 'react-router-dom';
import { StoreContext } from '../../components/context/StoreContext';

const NGODashboard = ({ ngoId = "65f1a2b3c4d5e6f7a8b9c0d9" }) => {
    const [availableDonations, setAvailableDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    // ⏱️ LIVE TICKER: System time ko tracking state me rakha hai live update ke liye
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

    // 🔄 EFFECT 1: First time loading aur background polling (Har 5 seconds me auto-fetch)
    useEffect(() => {
        if (url) {
            fetchDonations(true); // Sirf pehli baar loader dikhega

            const pollInterval = setInterval(() => {
                fetchDonations(false); // Background me silent sync bina loading screen ke
            }, 5000); // 5 seconds interval

            return () => clearInterval(pollInterval); // Cleanup interval on component unmount
        }
    }, [url]);

    // ⏱️ EFFECT 2: Live timer state tracker jo system clock ko match karega
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000); // Live tracking every single second

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

    // 🎯 LIVE CLIENT FILTER: Jo food expire ho chuka hai, use instant list se remove kar do
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
            
            {/* 🎯 FIXED: Map variable ab 'liveActiveDonations' use karega state tracking ke liye */}
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