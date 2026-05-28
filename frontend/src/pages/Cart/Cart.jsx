import React, { useContext, useState } from "react";
import "./Cart.css";
import { StoreContext } from "../../components/context/StoreContext";
import { useNavigate } from "react-router-dom";
import ExploreMenu from "../../components/ExploreMenu/ExploreMenu";
import FoodDisplay from "../../components/FoodDisplay/FoodDisplay";

const Cart = ({ setShowLogin }) => {
  const {
    cartItems,
    food_list,
    removeFromCart,
    getTotalCartAmount,
    token,
    url,
    addOrderToAdmin
  } = useContext(StoreContext);

  const navigate = useNavigate();
  const [category, setCategory] = useState("All");

  const handleCheckout = () => {
    
    if (!token) {
      alert("Please Login First to Proceed to Payment");
      if (setShowLogin) setShowLogin(true);
      return;
    }

    const total = getTotalCartAmount();
    if (total === 0) {
      alert("Your cart is empty!");
      return;
    }

    const orderItems = food_list
      .filter((item) => cartItems[item._id] > 0)
      .map((item) => ({ ...item, quantity: cartItems[item._id] }));

  
    addOrderToAdmin({ 
      items: orderItems, 
      amount: total + 2, 
      date: new Date().toLocaleString() 
    });

    alert("Order placed successfully! Redirecting...");
    navigate("/order");
  };

  const totalAmount = getTotalCartAmount();

  return (
    <div className='cart'>
      {totalAmount > 0 ? (
        <div className="cart-content">
          <div className="cart-items">
            <div className="cart-items-title">
              <p>Items</p><p>Title</p><p>Price</p><p>Quantity</p><p>Total</p><p>Remove</p>
            </div>
            <br /><hr />
            {food_list.map((item) => {
              if (cartItems[item._id] > 0) {
                return (
                  <div key={item._id}>
                    <div className="cart-items-title cart-items-item">
                      <img src={item.image.startsWith('http') ? item.image : `${url}/images/${item.image}`} alt={item.name} loading="lazy" />
                      <p>{item.name}</p>
                      <p>₹{item.price}</p>
                      <p>{cartItems[item._id]}</p>
                      <p>₹{item.price * cartItems[item._id]}</p>
                      <p className='cross' onClick={() => removeFromCart(item._id)}>x</p>
                    </div>
                    <hr />
                  </div>
                );
              }
              return null;
            })}
          </div>
          
          <div className="cart-bottom">
            <div className="cart-total">
              <h2>Cart Total</h2>
              <div>
                <div className="cart-total-detail"><p>Subtotal</p><p>₹{totalAmount}</p></div>
                <hr />
                <div className="cart-total-detail"><p>Delivery Fee</p><p>₹2</p></div>
                <hr />
                <div className="cart-total-detail"><b>Total</b><b>₹{totalAmount + 2}</b></div>
              </div>
              <button onClick={handleCheckout} className="checkout-btn">PROCEED TO CHECKOUT</button>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "50px 0" }}><h2>Your cart is empty!</h2></div>
      )}
      
      <div className="cart-menu-display" style={{ marginTop: "50px" }}>
        <ExploreMenu category={category} setCategory={setCategory} />
        <FoodDisplay category={category} />
      </div>
    </div>
  );
};

export default Cart;