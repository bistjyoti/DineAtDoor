import React, { useContext, useEffect, useState } from 'react'
import './MyOrders.css'
import { StoreContext } from '../../components/context/StoreContext';
import axios from 'axios';
import { assets } from '../../assets/assets';
import { useNavigate } from 'react-router-dom';

const MyOrders = () => {
    const { url, token } = useContext(StoreContext);
    const [data, setData] = useState([]);
    const navigate = useNavigate();

    const fetchOrders = async () => {
        const response = await axios.post(url + '/api/order/userorders', {}, { headers: { token } });
        setData(response.data.data);
    }

    useEffect(() => {
        if (token) {
            fetchOrders();
        }
    }, [token]);

    return (
        <div className='my-orders'>
            <h2>My Orders</h2>
            <div className="container">
                {data.map((order, index) => {
                    return (
                        <div key={order._id || index} className="my-orders-order">
                            <img src={assets.parcel_icon} alt="" loading="lazy" />
                            <p>
                                {order.items.map((item, idx) => {
                                    return idx === order.items.length - 1 
                                        ? `${item.name} x ${item.quantity}` 
                                        : `${item.name} x ${item.quantity}, `;
                                })}
                            </p>
                            <p>₹{order.amount}.00</p>
                            <p>Items: {order.items.length}</p>
                            <p>
                                <span>&#x25cf;</span> <b>{order.status}</b>
                            </p>
                            
                            {(order.status === "Food Processing" || order.status === "Out for Delivery") ? (
                                <button onClick={() => {
                                    console.log("Navigating to track-order...");
                                    navigate('/track-order');
                                }}>Track Order</button>
                            ) : (
                                <button className="disabled-btn" disabled>Order {order.status}</button>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default MyOrders;