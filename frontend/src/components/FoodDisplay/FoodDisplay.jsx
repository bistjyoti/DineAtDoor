import React, { useContext } from 'react'
import { StoreContext } from '../context/StoreContext'
import FoodItem from '../FoodItem/FoodItem'
import './FoodDisplay.css'

const FoodDisplay = ({category, selectedRestaurant}) => {

    const { food_list } = useContext(StoreContext) 

    const categoryKeywords = {
        Salad: ['salad'],
        Rolls: ['roll', 'wrap', 'shawarma', 'kathi'],
        Deserts: ['dessert', 'sweet', 'ice cream', 'kulfi', 'pastry', 'cake', 'brownie'],
        Sandwich: ['sandwich', 'burger'],
        Cake: ['cake', 'pastry', 'brownie'],
        'Pure Veg': ['veg', 'paneer', 'dal', 'chole', 'thali', 'sabzi'],
        Pasta: ['pasta', 'spaghetti', 'macaroni', 'alfredo'],
        Noodles: ['noodle', 'hakka', 'chowmein', 'ramen'],
        Indian: ['indian', 'biryani', 'curry', 'masala', 'naan', 'roti', 'dosa', 'idli', 'thali']
    };

    const matchesCategory = (item, selectedCategory) => {
        if (selectedCategory === "All") return true;
        const selected = selectedCategory.toLowerCase();
        const itemCategory = (item.category || '').toLowerCase();
        const searchText = `${item.name || ''} ${item.description || ''} ${item.category || ''}`.toLowerCase();
        const keywords = categoryKeywords[selectedCategory] || [selected];

        return (
            itemCategory === selected ||
            itemCategory.includes(selected) ||
            keywords.some((kw) => searchText.includes(kw))
        );
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