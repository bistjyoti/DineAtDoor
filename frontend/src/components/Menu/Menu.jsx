import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { StoreContext } from '../context/StoreContext'
import FoodItem from '../FoodItem/FoodItem'
import axios from 'axios'
import './Menu.css'

const Menu = () => {
    const { id } = useParams(); // URL se restaurant ID lene ke liye
    const { restaurant_list, url } = useContext(StoreContext);
    const [restaurant, setRestaurant] = useState(null);
    const [restaurantMenu, setRestaurantMenu] = useState([]);
    const [loadingMenu, setLoadingMenu] = useState(true);
    const [categoryFilter, setCategoryFilter] = useState('All');

    useEffect(() => {
        if (restaurant_list) {
            const found = restaurant_list.find(item => item._id === id);
            setRestaurant(found);
        }
    }, [id, restaurant_list]);

    useEffect(() => {
        axios.get(`${url}/api/restaurant/menu/${id}`)
            .then(res => {
                if (res.data.success) {
                    setRestaurantMenu(res.data.data);
                } else {
                    setRestaurantMenu([]);
                }
                setLoadingMenu(false);
            })
            .catch(err => {
                console.log(err);
                setRestaurantMenu([]);
                setLoadingMenu(false);
            });
    }, [id, url]);

    useEffect(() => {
        setCategoryFilter('All');
    }, [restaurantMenu]);

    if (!restaurant) return <div className='loader'>Loading...</div>;

    const categories = [
        'All',
        ...Array.from(new Set(restaurantMenu.map((item) => item.category || 'Other')))
    ];

    const visibleMenu = restaurantMenu.filter((item) => {
        const category = item.category || 'Other';
        return categoryFilter === 'All' || category === categoryFilter;
    });

    return (
        <div className='menu-page'>
            <div className='menu-top'>
                <img src={restaurant.image} alt={restaurant.name} />
                <div className='menu-name-rating'>
                    <h1>{restaurant.name}</h1>
                    <p>⭐ {restaurant.rating || '4.0'}</p>
                    <p>{restaurant.description || 'Delicious food available here.'}</p>
                </div>
            </div>

            {restaurantMenu.length > 0 && (
                <div className='menu-categories'>
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            className={categoryFilter === cat ? 'active-category' : ''}
                            onClick={() => setCategoryFilter(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            )}

            <div className='menu-items'>
                {loadingMenu ? (
                    <div className='loader'>Loading menu...</div>
                ) : visibleMenu.length > 0 ? (
                    visibleMenu.map((item, index) => (
                        <FoodItem
                            key={index}
                            id={item._id}
                            name={item.name}
                            description={item.description}
                            price={item.price}
                            image={item.image}
                        />
                    ))
                ) : (
                    <div className='no-dishes'>
                        <h2>No dishes are available for this restaurant yet.</h2>
                        <p>This restaurant does not have a menu in the database right now.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Menu