import React, { useContext } from "react";
import { assets } from "../../assets/assets";
import "./FoodItem.css";
import { StoreContext } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';

const FoodItem = ({ id, name, price, description, image, isRestaurant }) => {
  const { cartItems, addToCart, removeFromCart } = useContext(StoreContext);
  const navigate = useNavigate();

  const handleItemClick = () => {
    if (isRestaurant) {
       console.log("Restaurant Clicked:", name);
    }
  };

  return (
    <div className="food-item" onClick={handleItemClick} style={{ cursor: isRestaurant ? "pointer" : "default" }}>
      <div className="food-item-info">
        <div className="food-item-name-rating">
          <p className="food-item-name">{name}</p>
          <div className="star">
            <img src={assets.rating_starts} alt="" loading="lazy" />
          </div>
        </div>
        
        <p className="food-item-desc">
            {description.length > 50 ? description.slice(0, 50) + "..." : description}
        </p>
        
        <p className="food-item-price">₹{price}</p>
      </div>

      <div className="food-item-img-container">
        <img 
          src={image} 
          className="food-main-img" 
          alt={name}
          loading="lazy"
          onError={(e) => {
            const lowerName = name.toLowerCase();
            if (lowerName.includes("cake") || lowerName.includes("velvet") || lowerName.includes("waffle") || lowerName.includes("dry cake")) {
              e.target.src = "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&auto=format&fit=crop&q=60";
            } else if (lowerName.includes("burger")) {
              e.target.src = "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&auto=format&fit=crop&q=60";
            } else {
              e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&auto=format&fit=crop&q=60";
            }
          }}
        />

        {!cartItems[id] ? (
          <button
            className="add-btn-premium"
            onClick={(e) => {
                e.stopPropagation();
                addToCart(id);
            }}
          >
            ADD
          </button>
        ) : (
          <div className="food-item-counter-premium" onClick={(e) => e.stopPropagation()}>
            <span className="counter-minus" onClick={() => removeFromCart(id)}>-</span>
            <span className="counter-number">{cartItems[id]}</span>
            <span className="counter-plus" onClick={() => addToCart(id)}>+</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodItem;