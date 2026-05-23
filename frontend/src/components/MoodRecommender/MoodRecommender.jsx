import React, { useState, useContext, useMemo } from 'react';
import './MoodRecommender.css';
import { StoreContext } from '../context/StoreContext'; 
import FoodItem from '../FoodItem/FoodItem';

const MoodRecommender = ({ category, setCategory }) => {
  const { food_list } = useContext(StoreContext);
  const [selectedMood, setSelectedMood] = useState(null);

  const moodData = [
    { name: 'Hungry', emoji: '😋', key: 'hungry' },
    { name: 'Sad', emoji: '😔', key: 'sad' },
    { name: 'Happy', emoji: '😄', key: 'happy' },
    { name: 'Party', emoji: '🥳', key: 'party' },
    { name: 'Hot', emoji: '🥵', key: 'hot' },
    { name: 'Cold', emoji: '🥶', key: 'cold' }
  ];

  const handleMoodSelect = (moodKey) => {
    const nextMood = selectedMood === moodKey ? null : moodKey;
    setSelectedMood(nextMood);

    if (nextMood === 'hungry') setCategory('Indian');
    else if (nextMood === 'sad') setCategory('Deserts');
    else if (nextMood === 'happy') setCategory('Cake');
    else if (nextMood === 'party') setCategory('Pizza');
    else if (nextMood === 'hot') setCategory('Cold drinks');
    else if (nextMood === 'cold') setCategory('Soup');
    else setCategory('All');
  };

  // 🎯 Perfect Targeted Filtering Logic: Avoids generic description cross-matching
  const recommendedDishes = useMemo(() => {
    if (!selectedMood) return [];
    const normalizedMood = selectedMood.toLowerCase().trim();
    
    return food_list.filter(item => {
        const description = (item.description || '').toLowerCase();
        const itemName = (item.name || '').toLowerCase();
        const itemCategory = (item.category || '').toLowerCase();
        
        // 1. HUNGRY: Core filling North Indian, Meals, Thalis, Biryanis & Heavy Meat items
        if (normalizedMood === 'hungry') {
            if (itemCategory.includes('indian') || itemName.includes('biryani') || itemName.includes('thali') || itemName.includes('rice') || itemName.includes('paneer') || itemName.includes('curry') || itemName.includes('mutton') || itemName.includes('chicken')) {
                // Pizza and light items completely skipped from heavy hungry state
                if (itemCategory.includes('pizza') || itemName.includes('cake') || itemName.includes('ice cream')) return false;
                return true;
            }
        }

        // 2. SAD: Pure Desserts, Waffles, Sweet Shakes, Ice Creams, Pastries
        if (normalizedMood === 'sad') {
            if (itemCategory.includes('deserts') || itemCategory.includes('cake') || itemName.includes('ice cream') || itemName.includes('waffle') || itemName.includes('pastry') || itemName.includes('chocolate') || itemName.includes('shake') || itemName.includes('brownie')) {
                return true;
            }
        }

        // 3. HAPPY: Fast Foods, Italian Pastas, Rolls, Fries, Chinese Starters
        if (normalizedMood === 'happy') {
            if (itemCategory.includes('pasta') || itemName.includes('cake') || itemName.includes('sandwich') || itemName.includes('roll') || itemName.includes('fries') || itemName.includes('momos') || itemName.includes('nuggets')) {
                return true;
            }
        }
        
        // 4. PARTY: Pizzas, Celebration Cakes, Combos, Platters and Soft Drinks
        if (normalizedMood === 'party') {
            if (itemCategory.includes('pizza') || itemCategory.includes('cake') || itemName.includes('burger') || description.includes('combo') || itemName.includes('coke') || itemName.includes('platter')) {
                return true;
            }
        }

        // 5. HOT (Garmi): Smoothies, Cold Beverages, Ice Creams, Chilled Drinks
        if (normalizedMood === 'hot') {
            if (itemCategory.includes('cold drinks') || itemName.includes('drink') || itemName.includes('ice cream') || itemName.includes('juice') || itemName.includes('mojito') || itemName.includes('shake') || description.includes('chilled')) {
                return true;
            }
        }

        // 6. COLD (Thand/Sardi): Piping Hot Soups, Hot Tea/Chai, Indian Curries and Warm Coffees
        if (normalizedMood === 'cold') {
            if (itemName.includes('cold') || itemName.includes('ice')) return false; // Hard rejection
            if (itemCategory.includes('soup') || itemName.includes('tea') || itemName.includes('chai') || itemName.includes('thali') || description.includes('hot') || itemName.includes('curry') || (itemName.includes('coffee') && !itemName.includes('cold'))) {
                return true;
            }
        }

        return false;
    }).slice(0, 12); // Limits display to up to 12 items for premium clean spacing
  }, [selectedMood, food_list]);

  return (
    <div className='mood-recommender' id='mood-recommender'>
      <div className="mood-bar">
        <p className="mood-status-text">
          {selectedMood ? `Awesome, displaying meals for your ${moodData.find(m => m.key === selectedMood)?.name} mood! ✨` : "How are you feeling today? Let us pick your meal! ✨"}
        </p>
        <div className="mood-emojis">
          {moodData.map((mood) => {
            const isActive = selectedMood === mood.key;
            return (
              <div 
                key={mood.key} 
                onClick={() => handleMoodSelect(mood.key)}
                className={`mood-item ${isActive ? 'active' : ''}`}
              >
                <span className="mood-emoji-display">{mood.emoji}</span>
                <span className="mood-name">{mood.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {selectedMood && recommendedDishes.length > 0 && (
        <div className="recommendation-results">
          <h3>Top Special Recommendations for You ({recommendedDishes.length} Items):</h3>
          <div className="mood-food-list">
            {recommendedDishes.map((item, index) => (
              <FoodItem 
                key={index} 
                id={item._id} 
                name={item.name} 
                description={item.description} 
                price={item.price} 
                image={item.image}
              />
            ))}
          </div>
        </div>
      )}

      {selectedMood && recommendedDishes.length === 0 && (
        <p className="no-mood-dishes">Oops! Abhi is mood se matching koi item available nahi hai.</p>
      )}
    </div>
  );
};

export default MoodRecommender;