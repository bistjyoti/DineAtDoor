import React, { useState } from 'react'
import './Home.css'
import Header from '../../components/Header/Header'
import ExploreMenu from '../../components/ExploreMenu/ExploreMenu'
import FoodDisplay from '../../components/FoodDisplay/FoodDisplay'
import AppDownload from '../../components/AppDownload/AppDownload'
import RestaurantDisplay from '../../components/RestaurantDisplay/RestaurantDisplay'
import MoodRecommender from '../../components/MoodRecommender/MoodRecommender'

const Home = () => {
  const [category, setCategory] = useState('All')
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  return (
    <div>
      <Header />

      {/* MOOD RECOMMENDER  */}
      <MoodRecommender category={category} setCategory={setCategory} />

      {/* RESTAURANT SELECTION  */}
      <RestaurantDisplay setSelectedRestaurant={setSelectedRestaurant} selectedRestaurant={selectedRestaurant} />

      {/* FLASH SALE  */}
      <div className="flash-sale" style={{ background: 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)', color: 'white', padding: '25px', borderRadius: '15px', margin: '20px 5%', display: 'flex', flexDirection: 'column', boxShadow: '0 8px 20px rgba(255, 75, 43, 0.3)' }}>
        <h2 style={{ margin: 0 }}>🌙 Zero-Waste Flash Sale!</h2>
        <p>Get fresh unsold meals at <b>70% OFF</b> after 10 PM. 🌱</p>
      </div>

      {/*  MENU & DISHES */}
      <ExploreMenu category={category} setCategory={setCategory} />
      <FoodDisplay category={category} selectedRestaurant={selectedRestaurant} />
      
      <AppDownload />
    </div>
  )
}

export default Home