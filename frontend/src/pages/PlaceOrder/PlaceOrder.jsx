import React, { useContext, useEffect, useState } from 'react'
import './PlaceOrder.css'
import { StoreContext } from '../../components/context/StoreContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PlaceOrder = () => {
  const { getTotalCartAmount, token, food_list, cartItems, url } = useContext(StoreContext);
  const navigate = useNavigate();

  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: ""
  });

  const [loadingLocation, setLoadingLocation] = useState(false);

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
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
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
        );
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

        const fullAddress = resData.display_name.toLowerCase();
        if (fullAddress.includes("roorkee")) {
          alert("Location traced successfully! Roorkee location detected");
        } else {
          alert("Location traced successfully! Form autofilled.");
        }

      } catch (error) {
        alert("Failed to convert coordinates to address.");
      }
      setLoadingLocation(false);
    }, (error) => {
        alert("Please allow location access to fetch your address!");
        setLoadingLocation(false);
    });
  };

  const placeOrder = async (event) => {
    event.preventDefault(); 
    
    let orderItems = [];
    food_list.forEach((item) => {
      if (cartItems[item._id] > 0) {
        let itemInfo = { ...item }; 
        itemInfo["quantity"] = cartItems[item._id];
        orderItems.push(itemInfo);
      }
    });

    let orderData = {
      address: data,
      items: orderItems,
      amount: getTotalCartAmount() , 
    }

    try {
      let response = await axios.post(url + '/api/order/place', orderData, { headers: { token } });
      
      if (response.data.success) {
        const { session_url } = response.data;
  
        window.location.replace(session_url);
      } else {
        alert("Error: " + (response.data.message || "Backend payment integration failed or declined."));
      }
    } catch (err) {
      console.error("Order context processing crashed:", err);
      alert("Something went wrong with the payment request. Please verify your backend server is running.");
    }
  }

  useEffect(() => {
    if (!token) {
      navigate('/cart')
    } else if (getTotalCartAmount() === 0) {
      navigate('/cart')
    }
  }, [token, getTotalCartAmount, navigate]);

  return (
    <form onSubmit={placeOrder} className='place-order'>
      <div className="place-order-left">
        <p className="title">Delivery Information</p>
        
     
        <button 
          type="button"
          onClick={traceLocation}
          style={{
            backgroundColor: "tomato", 
            color: "white", 
            border: "none", 
            padding: "10px 15px", 
            borderRadius: "4px", 
            cursor: "pointer", 
            marginBottom: "20px", 
            fontWeight: "bold",
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            gap: "5px"
          }}
        >
          {loadingLocation ? "Detecting..." : "Use My Current Location"}
        </button>

        <div className="multi-fields">
          <input required name='firstName' onChange={onChangeHandler} value={data.firstName} type="text" placeholder='First Name' />
          <input required name='lastName' onChange={onChangeHandler} value={data.lastName} type="text" placeholder='Last Name' />
        </div>
        <input required name='email' onChange={onChangeHandler} value={data.email} type="email" placeholder='Email address' />
        <input required name='street' onChange={onChangeHandler} value={data.street} type="text" placeholder='Street' />
        
        <div className="multi-fields">
          <input required name='city' onChange={onChangeHandler} value={data.city} type="text" placeholder='City' />
          <input required name='state' onChange={onChangeHandler} value={data.state} type="text" placeholder='State' />
        </div>
        <div className="multi-fields">
          <input required name='zipcode' onChange={onChangeHandler} value={data.zipcode} type="text" placeholder='Zip code' />
          <input required name='country' onChange={onChangeHandler} value={data.country} type="text" placeholder='Country' />
        </div>
        <input required name='phone' onChange={onChangeHandler} value={data.phone} type="text" placeholder='Phone' />
      </div>

      <div className="place-order-right">
        <div className="cart-total">
          <h2>Cart Total</h2>
          <div>
            <div className="cart-total-detail">
              <p>Subtotal</p>
              <p>₹{getTotalCartAmount()}</p>
            </div>
            <hr />
            <div className="cart-total-detail">
              <p>Delivery Fee</p>
              <p>₹{getTotalCartAmount() === 0 ? 0 : 2}</p>
            </div>
            <hr />
            <div className="cart-total-detail">
              <b>Total</b>
              <b>₹{getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + 2}</b>
            </div>
          </div>
          <button type='submit'>PROCEED TO PAYMENT</button>
        </div>
      </div>
    </form>
  )
}

export default PlaceOrder;