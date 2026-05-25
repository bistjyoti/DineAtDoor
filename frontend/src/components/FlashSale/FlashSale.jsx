import React from 'react';
import './FlashSale.css';

const FlashSale = () => {
    return (
        <div className="flash-sale-container">
            <h3>🌙 Late Night Surplus Sale</h3>
            <p>Save food, save money! Limited stock available.</p>
            <button onClick={() => alert("Sale items loading...")}>View Surplus Meals</button>
        </div>
    );
};
export default FlashSale;