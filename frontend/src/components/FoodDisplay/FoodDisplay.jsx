import React, { useContext } from 'react'
import { StoreContext } from '../context/StoreContext'
import FoodItem from '../FoodItem/FoodItem'
import './FoodDisplay.css'

const FoodDisplay = ({category, selectedRestaurant}) => {

    const { food_list } = useContext(StoreContext) 

    const matchesCategory = (item, selectedCategory) => {
        if (selectedCategory === "All") return true;
        
        const selected = selectedCategory.toLowerCase().trim();
        const itemCategory = (item.category || '').toLowerCase().trim();
        const itemName = (item.name || '').toLowerCase().trim();
        
        if (selected === 'deserts' && (itemCategory === 'desserts' || itemCategory === 'dessert' || itemCategory === 'sweets & snacks')) return true;
        if (selected === 'indian' && (itemCategory === 'indian' || itemCategory === 'north indian' || itemCategory === 'south indian' || itemCategory === 'mughlai' || itemCategory === 'biryani')) return true;
        if (selected === 'burgers' && (itemCategory === 'burgers' || itemCategory === 'chicken & burgers')) return true;
        if (selected === 'rolls' && (itemCategory === 'rolls' || itemCategory === 'rolls & momos' || itemCategory === 'fast food')) return true;

        if (selected === 'salad') {
            return itemCategory === 'salad' || itemName.includes('salad') || itemName.includes('raita') || itemName.includes('papad');
        }
        
        if (selected === 'sandwich') {
            return itemCategory === 'sandwich' || itemName.includes('sandwich') || itemName.includes('toast') || itemName.includes('burger');
        }

        if (selected === 'pure veg') {
            return itemCategory === 'pure veg' || itemName.includes('veg') || itemName.includes('paneer') || itemName.includes('dal') || itemName.includes('chole');
        }

        return itemCategory === selected || itemCategory.includes(selected) || itemName.includes(selected);
    };

    return (
        <div className='food-display' id='food-display'>
            <h3>{selectedRestaurant ? "Menu" : "Top Dishes for you"}</h3>
            <div className="food-display-list">
                {food_list.map((item, index) => {
                    
                    const categoryMatch = matchesCategory(item, category);
                    const itemRestId = item.restaurantId?.toString();
                    const selectedRestId = selectedRestaurant?.toString();
                    const restaurantMatch = !selectedRestaurant || itemRestId === selectedRestId;

                    if (categoryMatch && restaurantMatch) {
                        return (
                            <FoodItem 
                                key={index} 
                                id={item._id} 
                                name={item.name} 
                                description={item.description} 
                                price={item.price} 
                                image={item.image}
                            />
                        )
                    }
                    return null;
                })}
            </div>
            {food_list.filter(item => {
                const cMatch = matchesCategory(item, category);
                const rMatch = !selectedRestaurant || item.restaurantId?.toString() === selectedRestaurant?.toString();
                return cMatch && rMatch;
            }).length === 0 && (
                <p className="no-dishes">Oops! Is category mein abhi koi dish available nahi hai</p>
            )}
        </div>
    )
}

export default FoodDisplay