import React, { useContext, useState, useEffect } from 'react'
import './Navbar.css'
import { assets } from '../../assets/assets';
import { Link, useNavigate } from 'react-router-dom'
import { StoreContext } from '../context/StoreContext';
import 'regenerator-runtime/runtime';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const Navbar = ({ setShowLogin, searchQuery, setSearchQuery }) => {
  const [menu, setMenu] = useState('home');
  const { getTotalCartAmount, token, setToken, food_list } = useContext(StoreContext);
  const navigate = useNavigate();
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [dishSuggestions, setDishSuggestions] = useState([]);
  const { transcript, interimTranscript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

  useEffect(() => {
    const SpeechText = transcript || interimTranscript;
    
    if (SpeechText && SpeechText.trim() !== "") {
      const wordsArray = SpeechText.trim().split(" ");
      const latestWord = wordsArray[wordsArray.length - 1];

      setSearchQuery(latestWord);
    
      const cleanText = latestWord.toLowerCase().trim();
      const matches = food_list.filter(item => 
        item.name.toLowerCase().includes(cleanText) || 
        item.category.toLowerCase().includes(cleanText)
      );
      setDishSuggestions(matches.slice(0, 5));
    }
  }, [transcript, interimTranscript, food_list, setSearchQuery]);

  const handleSearchTyping = (text) => {
    setSearchQuery(text);
    const cleanText = text.toLowerCase().trim();
    if (cleanText === "") { 
        setDishSuggestions([]); 
        return; 
    }
    const matches = food_list.filter(item => 
        item.name.toLowerCase().includes(cleanText) || 
        item.category.toLowerCase().includes(cleanText)
    );
    setDishSuggestions(matches.slice(0, 5));
  };

  const toggleVoiceSession = () => {
    if (!browserSupportsSpeechRecognition) {
      alert("Browser speech recognition does not support!");
      return;
    }
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      resetTranscript();
      setSearchQuery(""); 
      setDishSuggestions([]);
      setShowSearchModal(true);
      
      SpeechRecognition.startListening({ 
        continuous: true, 
        interimResults: true,
        language: 'en-IN' 
      });
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("name");
    setToken("");
    navigate("/");
    window.location.reload();
  }

  return (
    <div className='navbar'>
        <Link to='/' onClick={() => setMenu('home')}><img src={assets.logo} alt="Logo" className='logo' /></Link>
        
        <ul className="navbar-menu">
          <Link to='/' onClick={() => setMenu('home')} className={menu === 'home' ? 'active' : ''}>home</Link>
          <a href='#explore-menu' onClick={() => setMenu('menu')} className={menu === 'menu' ? 'active' : ''}>menu</a>
          <Link to='/myorders' onClick={() => setMenu('my-orders')} className={menu === 'my-orders' ? 'active' : ''}>my orders</Link>
          <a href='#footer' onClick={() => setMenu('contact-us')} className={menu === 'contact-us' ? 'active' : ''}>contact us</a>
        </ul>
        
        <div className="navbar-right" style={{ display: 'flex', alignItems: 'center', gap: '20px', visibility: 'visible' }}>
          <button 
            onClick={toggleVoiceSession}
            style={{ background: listening ? '#ff4d4d' : 'tomato', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '20px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', display: 'inline-block', visibility: 'visible', opacity: 1 }}
          >
            {listening ? "🎙️ Listening..." : "🎤 Speak"}
          </button>
          
          <img src={assets.search_icon} alt="Search" onClick={() => { setShowSearchModal(true); setSearchQuery(""); }} style={{ cursor: 'pointer', width: '22px' }} />
          
          <div className="navbar-search-icon" onClick={() => navigate('/cart')} style={{ cursor: "pointer" }}>
            <img src={assets.basket_icon} alt="Cart" />
            <div className={getTotalCartAmount() === 0 ? '' : 'dot'}></div>
          </div>
          
          {!token ? (
            <button onClick={() => setShowLogin(true)}>sign in</button>
          ) : (
            <div className='navbar-profile'>
              <img src={assets.profile_icon} alt="Profile" />
              <ul className="nav-profile-dropdown">
                <li onClick={() => navigate('/myorders')}>
                  <img src={assets.bag_icon} alt="Orders" /><p>Orders</p>
                </li>
                <hr />
                <li onClick={logout}>
                  <img src={assets.logout_icon} alt="Logout" /><p>Logout</p>
                </li>
              </ul>
            </div>
          )}
        </div>

        {showSearchModal && (
          <div style={{position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(255, 255, 255, 0.98)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '12vh'}}>
            <div style={{ width: '90%', maxWidth: '600px', position: 'relative' }}>
              
              <span onClick={() => { setShowSearchModal(false); SpeechRecognition.stopListening(); resetTranscript(); }} style={{ position: 'absolute', right: '10px', top: '-50px', fontSize: '38px', cursor: 'pointer' }}>×</span>
              
              {listening && (
                <div style={{ color: '#ff4d4d', fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ height: '8px', width: '8px', backgroundColor: '#ff4d4d', borderRadius: '50%', display: 'inline-block' }}></span>
                  🎙️ Live Listening... Speak now!
                </div>
              )}

              <input 
                type="text" 
                value={searchQuery} 
                onChange={(e) => handleSearchTyping(e.target.value)} 
                placeholder={listening ? "Start Speaking your favourite food...." : "Speak or type the dishes you like...."} 
                style={{ width: '100%', padding: '16px', borderRadius: '30px', border: listening ? '2px solid #ff4d4d' : '2px solid tomato', fontSize: '18px', outline: 'none' }} 
              />
              
              {dishSuggestions.map((dish, i) => (
                <div key={i} onClick={() => {setSearchQuery(dish.name); setShowSearchModal(false); SpeechRecognition.stopListening(); resetTranscript();}} style={{ padding: '15px', cursor: 'pointer', borderBottom: '1px solid #eee', backgroundColor: '#fff' }}>{dish.name}</div>
              ))}
            </div>
          </div>
        )}
    </div>
  )
}
export default Navbar;
