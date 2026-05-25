import React, { useContext, useState, useEffect } from 'react'
import './PlaceOrder.css'
import { StoreContext } from '../../components/context/StoreContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PlaceOrder = () => {
  const { getTotalCartAmount, token, food_list, cartItems, url, addOrderToAdmin } = useContext(StoreContext);
  const navigate = useNavigate();
  const [data, setData] = useState({
    firstName: "", lastName: "", email: "", street: "",
    city: "", state: "", zipcode: "", country: "", phone: ""
  });

  const [loadingLocation, setLoadingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); 

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData(data => ({ ...data, [name]: value }))
  }

  const traceLocation = () => {
    setLoadingLocation(true);
    if (!navigator.geolocation) {
      alert("Oops! Your browser doesn't support live location.");
      setLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const resData = await response.json();
        const address = resData.address;
        
        setData(prev => ({
          ...prev,
          street: address.suburb || address.neighbourhood || address.road || "Near IIT Roorkee",
          city: address.city || address.town || "Roorkee",
          state: address.state || "Uttarakhand",
          zipcode: address.postcode || "247667",
          country: address.country || "India"
        }));
      } catch (error) {
        alert("Failed to convert coordinates.");
      }
      setLoadingLocation(false);
    }, () => {
        alert("Please allow location access!");
        setLoadingLocation(false);
    });
  };

  const placeOrder = async (event) => {
    event.preventDefault(); 
    if (isSubmitting) return; 

    let orderItems = [];
    food_list.forEach((item) => {
      if (cartItems[item._id] > 0) {
        let itemInfo = { ...item, quantity: cartItems[item._id] };
        orderItems.push(itemInfo);
      }
    });

    if (orderItems.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    let orderData = { address: data, items: orderItems, amount: getTotalCartAmount() + 2 };

    try {
      setIsSubmitting(true);
      addOrderToAdmin({ items: orderItems, totalAmount: orderData.amount, address: data });
      const response = await axios.post(`${url}/api/order/place`, orderData, { 
        headers: { token: token } 
      });
      
      if (response.data.success) {
        window.location.replace(response.data.session_url);
      } else {
        alert("Stripe gateway error.");
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error("Order error:", err);
      alert("Backend server connection failed.");
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    if (!token || getTotalCartAmount() === 0) {
      navigate('/cart');
    }
  }, [token, getTotalCartAmount, navigate]);

  return (
    <form onSubmit={placeOrder} className='place-order'>
      <div className="place-order-left">
         <p className="title">Delivery Information</p>
         <button type="button" onClick={traceLocation}>{loadingLocation ? "Detecting..." : "Use My Current Location"}</button>
         <div className="multi-fields">
           <input required name='firstName' onChange={onChangeHandler} value={data.firstName} type="text" placeholder='First Name' />
           <input required name='lastName' onChange={onChangeHandler} value={data.lastName} type="text" placeholder='Last Name' />
         </div>
      
         <input required name='email' onChange={onChangeHandler} value={data.email} type="email" placeholder='Email address' />
         <input required name='street' onChange={onChangeHandler} value={data.street} type="text" placeholder='Street' />
      </div>

      <div className="place-order-right">
        <div className="cart-total">
          <h2>Cart Total</h2>
          <button type='submit' disabled={isSubmitting}>
            {isSubmitting ? "REDIRECTING..." : "PROCEED TO PAYMENT"}
          </button>
        </div>
      </div>
    </form>
  )
}

export default PlaceOrder;