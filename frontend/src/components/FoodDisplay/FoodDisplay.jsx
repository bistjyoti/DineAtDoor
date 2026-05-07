import React, { useContext } from 'react'
import { StoreContext } from '../context/StoreContext'
import FoodItem from '../FoodItem/FoodItem'
import './FoodDisplay.css'

// 💡 Props mein 'selectedRestaurant' add kiya jo Home.jsx se aa raha hai
const FoodDisplay = ({category, selectedRestaurant}) => {

    const { food_list } = useContext(StoreContext) 

    return (
        <div className='food-display' id='food-display'>
            <h3>{selectedRestaurant ? "Menu" : "Top Dishes for you"}</h3>
            <div className="food-display-list">
                {food_list.map((item, index) => {
                    
                    // 🎯 Logical Filtering:
                    // 1. Check karo category 'All' hai ya match ho rahi hai.
                    // 2. Check karo ki koi restaurant selected hai ya nahi.
                    // 3. Agar selected hai, toh wahi dish dikhao jiska restaurantId match kare.
                    
                    const categoryMatch = category === "All" || item.category === category;
                    const restaurantMatch = !selectedRestaurant || item.restaurantId === selectedRestaurant;

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
            {/* 📝 Pro-tip: Agar filter ke baad koi dish na mile toh user ko batana achha rehta hai */}
            {food_list.filter(item => (category === "All" || item.category === category) && (!selectedRestaurant || item.restaurantId === selectedRestaurant)).length === 0 && (
                <p className="no-dishes">Oops! Is category mein abhi koi dish available nahi hai.</p>
            )}
        </div>
    )
}

export default FoodDisplay