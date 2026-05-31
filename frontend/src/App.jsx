import React, { useState } from 'react'
import Navbar from './components/Navbar/Navbar'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home/Home'
import Cart from './pages/Cart/Cart'
import PlaceOrder from './pages/PlaceOrder/PlaceOrder'
import Footer from './components/Footer/Footer'
import LoginPopup from './components/LoginPopup/LoginPopup'
import Verify from './pages/Verify/Verify'
import MyOrders from './pages/MyOrders/MyOrders'
import Menu from './components/Menu/Menu'
import OrderTracking from './pages/OrderTracking/OrderTracking'
import Admin from './pages/AdminPanel/AdminPanel'
import DonateFood from './pages/DonateFood/DonateFood' 
import NGODashboard from './pages/NGODashboard/NGODashboard' // Naya Import

const App = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); 

  return (
    <>
      {showLogin ? <LoginPopup setShowLogin={setShowLogin} /> : <></>}
      
      <div className='app'>
        <Navbar 
          setShowLogin={setShowLogin} 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
        />
        
        <Routes>
          <Route path='/' element={<Home searchQuery={searchQuery} />} />
          <Route path='/menu/:id' element={<Menu />} />
          <Route path='/cart' element={<Cart setShowLogin={setShowLogin} />} />
          <Route path='/order' element={<PlaceOrder setShowLogin={setShowLogin} />} />
          <Route path='/verify' element={<Verify />} />
          <Route path='/myorders' element={<MyOrders />} />
          <Route path='/track-order' element={<OrderTracking />} />
          <Route path='/admin' element={<Admin />} />
          <Route path='/donate' element={<DonateFood />} /> 
          <Route path='/ngo' element={<NGODashboard />} /> {/* Naya Route Added */}
        </Routes>
      </div>
      
      <Footer />
    </>
  )
}

export default App;