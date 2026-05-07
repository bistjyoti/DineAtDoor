import React, { useContext } from "react";
import { assets } from "../../assets/assets";
import "./FoodItem.css";
import { StoreContext } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';

const FoodItem = ({ id, name, price, description, image, isRestaurant }) => {
  const { cartItems, addToCart, removeFromCart } = useContext(StoreContext);
  const navigate = useNavigate();

  // Jab koi card par click karega
  const handleItemClick = () => {
    if (isRestaurant) {
       console.log("Restaurant Clicked:", name);
       // Agar tumne Restaurant detail page banaya hai toh niche wali line uncomment kar dena:
       // navigate(`/restaurant/${id}`); 
    }
  };

  return (
    <div className="food-item" onClick={handleItemClick} style={{ cursor: isRestaurant ? "pointer" : "default" }}>
      <div className="food-item-img-container">
        <img src={image} className="food-item-image" alt={name} />

        {/* Counter Buttons: Ye sirf tab dikhenge agar hum cart me add karna chahte hain */}
        {!cartItems[id] ? (
          <img
            className="add"
            src={assets.add_icon_white}
            onClick={(e) => {
                e.stopPropagation(); // Taaki click sirf button par ho, poore card par nahi
                addToCart(id);
            }}
            alt=""
          />
        ) : (
          <div className="food-item-counter" onClick={(e) => e.stopPropagation()}>
            <img
              onClick={() => removeFromCart(id)}
              src={assets.remove_icon_red}
              alt=""
            />
            <p>{cartItems[id]}</p>
            <img
              onClick={() => addToCart(id)}
              src={assets.add_icon_green}
              alt=""
            />
          </div>
        )}
      </div>

      <div className="food-item-info">
        <div className="food-item-name-rating">
          <p>{name}</p>
          <div className="star">
            <img src={assets.rating_starts} alt="" />
          </div>
        </div>
        
        {/* Description: Isko humne limit kar diya taaki card ki height barabar rahe */}
        <p className="food-item-desc">
            {description.length > 50 ? description.slice(0, 50) + "..." : description}
        </p>
        
        <p className="food-item-price">₹{price}</p>
      </div>
    </div>
  );
};

export default FoodItem;