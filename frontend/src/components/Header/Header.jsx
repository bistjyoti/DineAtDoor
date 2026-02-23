import React from 'react'
import './Header.css'
import { assets } from '../../assets/assets' // Path check kar lena sahi hai na?

const Header = () => {
  return (
    <div className='header' style={{backgroundImage: `url(${assets.header_img})`}}>
        <div className="header-contents">
            <h2>Order your favourite food here</h2>
            <p>Satisfy your cravings with the best of Indian and Fast Food. From spicy Biryanis to cheesy Pizzas, we deliver happiness at your doorstep.</p>
            <button>View Menu</button>
        </div>
    </div>
  )
}

export default Header