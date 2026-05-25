import React, { useContext } from 'react';
import './AdminPanel.css';
import { StoreContext } from '../../components/context/StoreContext'; 

const AdminPanel = () => {
  const { 
    isFlashSaleActive, 
    toggleFlashSale, 
    orders, 
    acceptOrder 
  } = useContext(StoreContext); 

  return (
    <div className="admin-container">
      <h1>Admin Dashboard</h1>

      <div className="card">
        <h3>Flash Sale: {isFlashSaleActive ? "ON" : "OFF"}</h3>
        <button onClick={toggleFlashSale} className={isFlashSaleActive ? "btn-off" : "btn-on"}>
          {isFlashSaleActive ? "Disable Flash Sale" : "Enable Flash Sale"}
        </button>
      </div>

      <div className="card">
        <h3>Incoming Orders</h3>
        {(!orders || orders.length === 0) ? (
          <p>No new orders yet.</p>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="order-item" style={{border: "1px solid #ccc", padding: "10px", margin: "10px 0"}}>
              <p><strong>Order #{order.id}</strong></p>
              <p>Total: ₹{order.amount}</p>
              <p>Status: {order.status}</p>
              {order.status === "Pending" && (
                <button onClick={() => acceptOrder(order.id)} className="btn-accept">
                  Accept Order
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminPanel;