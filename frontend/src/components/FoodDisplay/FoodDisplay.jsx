import React, { useContext } from 'react'
import { StoreContext } from '../context/StoreContext'
import FoodItem from '../FoodItem/FoodItem'
import './FoodDisplay.css'

const FoodDisplay = ({ category, selectedRestaurant, searchQuery }) => {

    const { food_list } = useContext(StoreContext) 

    const matchesCategory = (item, selectedCategory) => {
        if (selectedCategory === "All") return true;
        
        const selected = selectedCategory.toLowerCase().trim();
        const itemCategory = (item.category || '').toLowerCase().trim();
        const itemName = (item.name || '').toLowerCase().trim();
        
        if (selected === 'deserts' && (itemCategory === 'desserts' || itemCategory === 'dessert' || itemCategory === 'sweets & snacks')) return true;
        if (selected === 'indian' && (itemCategory === 'indian' || itemCategory === 'north indian' || itemCategory === 'south indian' || itemCategory === 'biryani')) return true;
        if (selected === 'burgers' && (itemCategory === 'burgers' || itemCategory === 'fast food')) return true;
        
        // 1. Rolls Fix: Sirf real rolls dikhao, rice/thupka ko skip karo jo galti se fast food category mein hain
        if (selected === 'rolls') {
            if (itemName.includes('rice') || itemName.includes('thupka') || itemName.includes('talumien')) return false;
            return itemCategory === 'rolls' || itemCategory === 'fast food' || itemName.includes('roll');
        }
        
        // 2. Cakes Fix: Agar database mein strict cake item na ho, toh bakery ya dessert ke kuch items fall back karwa do
        if (selected === 'cake') {
            return itemCategory === 'cake' || itemCategory === 'cakes' || itemCategory === 'bakery' || itemCategory === 'dessert' || itemCategory === 'desserts' || itemName.includes('cake') || itemName.includes('pastry');
        }

        // 3. Pasta Fix: Pasta category ya naam mein pasta check karo
        if (selected === 'pasta') {
            return itemCategory === 'pasta' || itemName.includes('pasta' || itemCategory === 'italian');
        }

        // 4. Noodles Fix: Noodles ke sath jo galat items rolls mein ja rahe the, unhe yahan unki sahi jagah par dikhao
        if (selected === 'noodles') {
            return itemCategory === 'noodles' || itemCategory === 'chinese' || itemName.includes('noodles') || itemName.includes('thupka') || itemName.includes('talumien') || itemName.includes('chowmein');
        }

        if (selected === 'salad') return itemCategory === 'salad' || itemName.includes('salad');
        if (selected === 'sandwich') return itemCategory === 'sandwich' || itemName.includes('sandwich');
        if (selected === 'pure veg') return itemCategory === 'pure veg' || itemName.includes('veg') || itemName.includes('paneer');

        return itemCategory === selected || itemCategory.includes(selected);
    };

    const filteredDishes = food_list.filter(item => {
        const categoryMatch = matchesCategory(item, category);
        
        const itemRestId = item.restaurantId?.toString();
        const selectedRestId = selectedRestaurant?.toString();
        const restaurantMatch = !selectedRestaurant || itemRestId === selectedRestId;
        const query = (searchQuery || '').toLowerCase().trim();
        
        let processedQuery = query;
        if (query.includes("bri") || query.includes("bir")) processedQuery = "biryani";
        if (query.includes("piz") || query.includes("piz")) processedQuery = "pizza";

        const searchMatch = !processedQuery || 
                            (item.name || '').toLowerCase().includes(processedQuery) || 
                            (item.category || '').toLowerCase().includes(processedQuery) ||
                            (item.description || '').toLowerCase().includes(processedQuery);

        return categoryMatch && restaurantMatch && searchMatch;
    });

    return (
        <div className='food-display' id='food-display'>
            <h3>Top Dishes For You</h3>
            
            <div className="food-display-list">
                {filteredDishes.map((item, index) => (
                    <FoodItem 
                        key={item._id || index} 
                        id={item._id} 
                        name={item.name} 
                        description={item.description} 
                        price={item.price} 
                        image={item.image}
                    />
                ))}
            </div>

            {filteredDishes.length === 0 && (
                <p className="no-dishes" style={{ textAlign: 'center', padding: '50px 20px', color: 'tomato', fontWeight: 'bold', fontSize: '18px' }}>
                    Oops! No dishes available according to your search.
                </p>
            )}
        </div>
    )
}

export default FoodDisplay;