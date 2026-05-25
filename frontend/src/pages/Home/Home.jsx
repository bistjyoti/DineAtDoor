import React, { useState, useEffect } from 'react'
import './Home.css'
import Header from '../../components/Header/Header'
import ExploreMenu from '../../components/ExploreMenu/ExploreMenu'
import FoodDisplay from '../../components/FoodDisplay/FoodDisplay'
import AppDownload from '../../components/AppDownload/AppDownload'
import RestaurantDisplay from '../../components/RestaurantDisplay/RestaurantDisplay'
import MoodRecommender from '../../components/MoodRecommender/MoodRecommender'
import FlashSale from '../../components/FlashSale/FlashSale' 

const Home = ({ searchQuery }) => {
  const [category, setCategory] = useState('All')
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const isFlashSaleActive = localStorage.getItem('isFlashSaleOn') === 'true';

  return (
    <div>
      <Header />

      <MoodRecommender category={category} setCategory={setCategory} />

      {isFlashSaleActive && <FlashSale />} 
      
      <RestaurantDisplay 
        setSelectedRestaurant={setSelectedRestaurant} 
        selectedRestaurant={selectedRestaurant} 
      />

      <ExploreMenu category={category} setCategory={setCategory} />
      
      <FoodDisplay 
        category={category} 
        selectedRestaurant={selectedRestaurant} 
        searchQuery={searchQuery} 
      />
      
      <AppDownload />
    </div>
  )
}

export default Home;