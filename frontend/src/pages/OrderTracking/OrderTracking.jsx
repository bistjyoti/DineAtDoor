import React, { useState, useEffect } from 'react';
import './OrderTracking.css';

const OrderTracking = () => {
  const [status, setStatus] = useState(0); 
  const steps = ["Order Placed", "Preparing", "Out for Delivery", "Delivered"];

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 3000);

    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="tracking-container" style={{ padding: '50px', textAlign: 'center' }}>
      <h2>Order Status</h2>
      <div className="stepper" style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '20px' }}>
        {steps.map((step, index) => (
          <div key={index} className={`step ${index <= status ? 'active' : ''}`} style={{ textAlign: 'center' }}>
            <div className="circle" style={{ 
                width: '40px', height: '40px', borderRadius: '50%', 
                backgroundColor: index <= status ? '#ff6347' : '#ddd', 
                color: 'white', display: 'flex', alignItems: 'center', 
                justifyContent: 'center', margin: '0 auto' 
            }}>
                {index < status ? "✓" : index + 1}
            </div>
            <p>{step}</p>
          </div>
        ))}
      </div>
      
      <div className="status-message" style={{ marginTop: '30px', fontWeight: 'bold' }}>
        {status < 3 ? "Your order is being processed... 🚚" : "Your order has been delivered! Enjoy! 😋"}
      </div>
    </div>
  );
};

export default OrderTracking;