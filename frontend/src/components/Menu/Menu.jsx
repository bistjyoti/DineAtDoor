import React, { useContext, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { StoreContext } from '../context/StoreContext'
import './Menu.css'

const Menu = () => {
    const { id } = useParams(); 
    const navigate = useNavigate();
    const { food_list, restaurant_list } = useContext(StoreContext);

    
    console.log("URL ID:", id);
    console.log("Sample Food Item Restaurant ID:", food_list[0]?.restaurant_id);

    const restaurant = restaurant_list?.find(res => String(res._id) === String(id));

    
    const restaurantMenu = food_list?.filter(item => String(item.restaurant_id) === String(id));

    return (
        <div className='menu'>
            <div className="menu-header">
                <button onClick={() => navigate('/')} className="back-btn">← Back</button>
                <h2>{restaurant ? restaurant.name : "Restaurant Menu"}</h2>
            </div>

            <div className="menu-list">
                {restaurantMenu && restaurantMenu.length > 0 ? (
                    restaurantMenu.map((item) => (
                        <div key={item._id} className='menu-item'>
                            <img src={item.image} alt="" onError={(e) => e.target.src="https://via.placeholder.com/150"}/>
                            <div className="menu-item-info">
                                <p><b>{item.name}</b></p>
                                <p>₹{item.price}</p>
                                <button className="add-btn">Add to Cart</button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-menu">
                        <p>Oops! No dishes available for this restaurant</p>
                        <small>Check if food_list items have restaurant_id matching with: {id}</small>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Menu;