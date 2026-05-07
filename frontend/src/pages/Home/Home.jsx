import React, { useState, useEffect } from 'react'
import './Home.css'
import Header from '../../components/Header/Header'
import ExploreMenu from '../../components/ExploreMenu/ExploreMenu'
import FoodDisplay from '../../components/FoodDisplay/FoodDisplay'
import AppDownload from '../../components/AppDownload/AppDownload'
import RestaurantDisplay from '../../components/RestaurantDisplay/RestaurantDisplay' // ✨ Naya Component

const Home = () => {
  const [category, setCategory] = useState('All')
  const [userMood, setUserMood] = useState(localStorage.getItem('userMood') || 'Normal')
  
  // ✨ Swiggy-like state: track karega ki kaunsa restaurant select hua hai
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  useEffect(() => {
    if (userMood === 'Tired') { setCategory('Pasta'); }
    else if (userMood === 'Party') { setCategory('Cake'); }
    else if (userMood === 'Healthy') { setCategory('Salad'); }
    else if (userMood === 'Hungry') { setCategory('Indian'); }
    
    localStorage.setItem('userMood', userMood);
  }, [userMood]);

  return (
    <div>
      <Header />

      {/* --- MOOD BAR (Existing) --- */}
      <div className="mood-bar" style={{ textAlign: 'center', padding: '20px', backgroundColor: '#f8f9fa', margin: '10px 5%', borderRadius: '15px', border: '1px solid #eee' }}>
        <p style={{ margin: '0 0 10px 0', fontWeight: '600', color: '#444' }}>
           How are you feeling today? Let us pick your meal! ✨
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '25px', fontSize: '30px' }}>
          <span onClick={() => setUserMood('Hungry')} style={{ cursor: 'pointer', filter: userMood === 'Hungry' ? 'grayscale(0)' : 'grayscale(1)', transition: '0.3s' }}>😋</span>
          <span onClick={() => setUserMood('Tired')} style={{ cursor: 'pointer', filter: userMood === 'Tired' ? 'grayscale(0)' : 'grayscale(1)', transition: '0.3s' }}>😴</span>
          <span onClick={() => setUserMood('Party')} style={{ cursor: 'pointer', filter: userMood === 'Party' ? 'grayscale(0)' : 'grayscale(1)', transition: '0.3s' }}>🥳</span>
          <span onClick={() => setUserMood('Healthy')} style={{ cursor: 'pointer', filter: userMood === 'Healthy' ? 'grayscale(0)' : 'grayscale(1)', transition: '0.3s' }}>🥗</span>
        </div>
      </div>

      {/* --- RESTAURANT SELECTION (New Step!) --- */}
      {/* Hum pehle restaurants dikhayenge. setSelectedRestaurant function pass kar rahe hain */}
      <RestaurantDisplay setSelectedRestaurant={setSelectedRestaurant} selectedRestaurant={selectedRestaurant} />

      {/* --- FLASH SALE (Existing) --- */}
      <div className="flash-sale" style={{ background: 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)', color: 'white', padding: '25px', borderRadius: '15px', margin: '20px 5%', display: 'flex', flexDirection: 'column', boxShadow: '0 8px 20px rgba(255, 75, 43, 0.3)' }}>
        <h2 style={{ margin: 0 }}>🌙 Zero-Waste Flash Sale!</h2>
        <p>Get fresh unsold meals at <b>70% OFF</b> after 10 PM. 🌱</p>
      </div>

      {/* --- MENU & DISHES --- */}
      {/* Ab hum FoodDisplay ko selectedRestaurant bhi bhejenge taaki wo filter kar sake */}
      <ExploreMenu category={category} setCategory={setCategory} />
      <FoodDisplay category={category} selectedRestaurant={selectedRestaurant} />
      
      <AppDownload />
    </div>
  )
}

export default Home