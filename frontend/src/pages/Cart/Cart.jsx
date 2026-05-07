import React, { useContext, useState, useRef } from 'react'
import './Cart.css'
import axios from 'axios'
import { StoreContext } from '../../components/context/StoreContext'
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header'
import ExploreMenu from '../../components/ExploreMenu/ExploreMenu'
import FoodDisplay from '../../components/FoodDisplay/FoodDisplay'

const Cart = ({ setShowLogin }) => {
  const { cartItems, food_list, removeFromCart, getTotalCartAmount, token, url } = useContext(StoreContext);
  const navigate = useNavigate();
  const videoRef = useRef(null);

  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState("AI IDENTITY CHECK...");
  const [category, setCategory] = useState("All");

  const startCamera = async () => {
    if (!token) {
      alert("🚨 Access Denied! Please Sign In first.");
      setShowLogin(true);
      return;
    }
    if (getTotalCartAmount() === 0) return;

    setIsScanning(true);
    setScanStatus("AI IDENTITY CHECK...");

    let stream = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;

      setTimeout(async () => {
        try {
          if (!videoRef.current) throw new Error('Camera not available');

          const video = videoRef.current;
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth || 320;
          canvas.height = video.videoHeight || 240;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const faceImage = canvas.toDataURL('image/png');

          const response = await axios.post(
            `${url}/api/user/face/verify`,
            { faceImage },
            { headers: { authorization: `Bearer ${token}` } }
          );

          stream.getTracks().forEach(track => track.stop());

          if (response.data.success) {
            setScanStatus("FACE VERIFIED ✅ PROCEEDING...");
            setTimeout(() => { setIsScanning(false); navigate('/order'); }, 1500);
          } else {
            setScanStatus("FACE NOT VERIFIED ❌");
            setTimeout(() => { setIsScanning(false); alert(response.data.message || "Face verification failed."); }, 2000);
          }
        } catch (verifyError) {
          console.error('Face verify error:', verifyError);
          setScanStatus("FACE VERIFICATION FAILED ❌");
          if (stream) stream.getTracks().forEach(track => track.stop());
          setTimeout(() => { setIsScanning(false); alert("Face verification failed. Please try again."); }, 2000);
        }
      }, 3000);
    } catch (err) {
      console.error('Camera start failed:', err);
      setIsScanning(false);
      alert('Cannot access camera. Please allow camera permission.');
      if (stream) stream.getTracks().forEach(track => track.stop());
    }
  };

  return (
    <div className='cart' style={{ position: 'relative', zIndex: 1 }}>
      
      {/* SCANNER OVERLAY - Iska Z-index 9999 hai but tabhi dikhega jab isScanning true ho */}
      {isScanning && (
        <div className="scanner-container" style={{position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 9999, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'white'}}>
          <div style={{width: '280px', height: '280px', border: '4px solid #00d4ff', borderRadius: '20px', overflow: 'hidden'}}>
            <video ref={videoRef} autoPlay playsInline style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          </div>
          <h2 style={{marginTop: '20px'}}>{scanStatus}</h2>
        </div>
      )}

      {/* --- CART SECTION --- */}
      {getTotalCartAmount() > 0 ? (
        <div className="cart-content">
          <div className="cart-items">
            <div className="cart-items-title"><p>Items</p><p>Title</p><p>Price</p><p>Quantity</p><p>Total</p><p>Remove</p></div>
            <br /><hr />
            {food_list.map((item, index) => {
              if (cartItems[item._id] > 0) {
                return (
                  <div key={index}>
                    <div className="cart-items-title cart-items-item">
                      <img src={item.image} alt="" /><p>{item.name}</p><p>₹{item.price}</p>
                      <p>{cartItems[item._id]}</p><p>₹{item.price * cartItems[item._id]}</p>
                      <p onClick={() => removeFromCart(item._id)} className='cross' style={{cursor:'pointer'}}>x</p>
                    </div><hr />
                  </div>
                )
              }
              return null;
            })}
          </div>
          <div className="cart-bottom">
            <div className="cart-total">
              <h2>Cart Total</h2>
              <div className="cart-total-detail"><p>Subtotal</p><p>₹{getTotalCartAmount()}</p></div><hr />
              <div className="cart-total-detail"><b>Total</b><b>₹{getTotalCartAmount() + 2}</b></div>
              <button onClick={startCamera} style={{cursor:'pointer'}}>PROCEED TO CHECKOUT</button>
            </div>
          </div>
        </div>
      ) : (
        <div style={{textAlign:'center', padding:'50px 0'}}>
            <h2 style={{marginBottom:'20px'}}>Your cart is empty. Hungry? 😋</h2>
            <Header />
        </div>
      )}

      {/* --- MENU SECTION (Always Clickable) --- */}
      <div className="cart-menu-display" style={{marginTop: "50px", position: 'relative', zIndex: 2}}>
          <ExploreMenu category={category} setCategory={setCategory} />
          <FoodDisplay category={category} />
      </div>
    </div>
  )
}

export default Cart