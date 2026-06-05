import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { StoreContext } from '../../components/context/StoreContext';
import './NGOHistory.css'; 

const NGOHistory = ({ ngoId = "65f1a2b3c4d5e6f7a8b9c0d9" }) => {
    const [historyList, setHistoryList] = useState([]);
    const [loading, setLoading] = useState(true);
    const { url } = useContext(StoreContext);
    const navigate = useNavigate();

    const fetchHistory = async () => {
        try {
            setLoading(true);
            // 🎯 Calling our freshly created history backend API route
            const response = await axios.get(`${url}/api/donations/history/${ngoId}`);
            if (response.data && response.data.success) {
                setHistoryList(response.data.data || []);
            }
            setLoading(false);
        } catch (error) {
            console.error("History load error:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (url) {
            fetchHistory();
        }
    }, [url]);

    if (loading) return <div className="loading-history">Loading your noble deeds... 💚</div>;

    return (
        <div className="ngo-history-container">
            <div className="history-header">
                <button onClick={() => navigate('/ngo')} className="back-dashboard-btn">⬅ Back to Dashboard</button>
                <h2>Your Noble Contributions 🎉</h2>
                <p className="history-subtitle">Food that you claimed and delivered to those in need.</p>
            </div>

            {historyList.length === 0 ? (
                <div className="no-history-box">You haven't made any food claims yet. Let's save some food! 🍲</div>
            ) : (
                <div className="history-table-wrapper">
                    <table className="history-table">
                        <thead>
                            <tr>
                                <th>🏢 Restaurant</th>
                                <th>📍 Address</th>
                                <th>🍲 Food Items</th>
                                <th>📦 Qty</th>
                                <th>✅ Claimed On</th>
                            </tr>
                        </thead>
                        <tbody>
                            {historyList.map((item) => (
                                <tr key={item._id}>
                                    <td className="res-name-cell">{item.restaurantName || "DineAtDoor Partner"}</td>
                                    <td className="address-cell">{item.restaurantAddress || "Address Not Available"}</td>
                                    <td>{item.foodItems}</td>
                                    <td><span className="qty-badge">{item.quantity}</span></td>
                                    <td className="date-cell">{new Date(item.updatedAt).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default NGOHistory;