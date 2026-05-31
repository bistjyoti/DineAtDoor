import React from 'react'
import './Footer.css'
import { assets } from '../../assets/assets'

const Footer = () => {
  return (
    <div className='footer' id='footer'>
        <div className="footer-content">
            <div className="footer-content-left">
                {/* 🎯 FIXED: Yahan class add kar di hai taaki CSS isse control kar sake */}
                <img src={assets.logo} className='footer-logo' alt="DineAtDoor Logo" />
                
                <p>DineAtDoor is your favorite food delivery partner, bringing fresh and delicious meals right to your doorstep with speed and care.</p>
                
                <div className="footer-social-icons">
                    <img src={assets.facebook_icon} alt="Facebook" />
                    <img src={assets.twitter_icon} alt="Twitter" />
                    <img src={assets.linkedin_icon} alt="Linkedin" />
                </div>
            </div>

            <div className="footer-content-center">
                <h2>COMPANY</h2>
                <ul>
                    <li>Home</li>
                    <li>About us</li>
                    <li>Delivery</li>
                    <li>Privacy Policy</li>
                </ul>
            </div>

            <div className="footer-content-right">
                <h2>GET IN TOUCH</h2>
                <ul>
                    <li>+91 8108709178</li>
                    <li>bistjyoti64@gmail.com</li>
                </ul>
            </div>
           
        </div>
        <hr />
        <p className="footer-copyright">
            Copyright 2026 &copy; DineAtDoor - All Rights Reserved.
        </p>
    </div>
  )
}

export default Footer;