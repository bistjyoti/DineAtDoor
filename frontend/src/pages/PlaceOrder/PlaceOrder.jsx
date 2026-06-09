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
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

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

      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        alert("Failed to load Razorpay SDK. Check your internet connection.");
        setIsSubmitting(false);
        return;
      }

      addOrderToAdmin({ items: orderItems, totalAmount: orderData.amount, address: data });


      const response = await axios.post(`${url}/api/order/place`, orderData, { 
        headers: { token: token } 
      });
      
      if (response.data.success) {
        const { razorpayOrder, localOrderId } = response.data;
        const options = {
          key: "rzp_test_SulDVCP4qQQeov", 
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          name: "DineAtDoor",
          description: "Food Delivery Payment",
          order_id: razorpayOrder.id,
          handler: async function (paymentResponse) {
            try {
            
              const verifyResponse = await axios.post(`${url}/api/order/verify`, {
                orderId: localOrderId,
                success: true,
                razorpay_payment_id: paymentResponse.razorpay_payment_id
              }, { headers: { token: token } });

              if (verifyResponse.data.success) {
                alert("Payment Successful! Order Placed.");
                navigate('/myorders'); 
              } else {
                alert("Payment verification failed.");
                navigate('/');
              }
            } catch (err) {
              console.error(err);
              alert("Error during payment verification.");
            }
          },
          prefill: {
            name: `${data.firstName} ${data.lastName}`,
            email: data.email,
            contact: data.phone || "9999999999"
          },
          theme: {
            color: "tomato" 
          },
          modal: {
            ondismiss: async function() {
              await axios.post(`${url}/api/order/verify`, {
                orderId: localOrderId,
                success: false
              }, { headers: { token: token } });
              alert("Payment Cancelled.");
              setIsSubmitting(false);
            }
          }
        };

        const rzp1 = new window.Razorpay(options);
        rzp1.open();

      } else {
        alert("Razorpay backend setup error.");
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
         <input name='phone' onChange={onChangeHandler} value={data.phone || ''} type="text" placeholder='Phone Number' />
      </div>

      <div className="place-order-right">
        <div className="cart-total">
          <h2>Cart Total</h2>
          <button type='submit' disabled={isSubmitting}>
            {isSubmitting ? "PROCESSING PAYMENT..." : "PROCEED TO PAYMENT"}
          </button>
        </div>
      </div>
    </form>
  )
}

export default PlaceOrder;