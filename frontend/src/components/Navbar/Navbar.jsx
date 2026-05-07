import React, { useContext, useState, useEffect } from 'react'
import './Navbar.css'
import { assets } from '../../assets/assets';
import { Link, useNavigate } from 'react-router-dom'
import { StoreContext } from '../context/StoreContext';

const Navbar = ({ setShowLogin }) => {

  const [menu, setMenu] = useState('home');
  const { getTotalCartAmount, token, setToken, currentLocation, setCurrentLocation, setLocationCoords } = useContext(StoreContext);
  const isLoggedIn = !!token || localStorage.getItem("isLoggedIn") === "true";
  const storedUserName = localStorage.getItem("userName") || "";
  const navigate = useNavigate();

  const [showLocationModal, setShowLocationModal] = useState(false);
  
  const [detailedAddress, setDetailedAddress] = useState({
    houseNo: "",
    area: "",
    landmark: "",
    city: "Roorkee",
    latitude: 29.8543,
    longitude: 77.8880
  });

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // --- 🎯 1. DYNAMIC AUTO DETECT (Ab ye puri duniya mein har jagah kaam karega!) ---
  const detectLocationSmart = () => {
    setCurrentLocation("Detecting... ⏳");
    if(showLocationModal) setShowLocationModal(false);

    if (!navigator.geolocation) {
      setPermanentLocation("Roorkee, Uttarakhand 📍");
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      setLocationCoords({ lat: latitude, lng: longitude });
      try {
        // Enhanced reverse geocoding with more detailed address parsing
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&extratags=1`);
        const data = await res.json();

        // More comprehensive address parsing
        const address = data.address || {};
        const displayName = data.display_name || '';

        // Extract detailed components
        const houseNumber = address.house_number || '';
        const road = address.road || address.pedestrian || address.path || '';
        const suburb = address.suburb || address.neighbourhood || address.residential || '';
        const city = address.city || address.town || address.village || address.municipality || "Roorkee";
        const district = address.county || address.state_district || '';
        const state = address.state || "Uttarakhand";
        const postcode = address.postcode || '';

        // Build a more precise location string
        let locationParts = [];

        // Add house number and road if available
        if (houseNumber && road) {
          locationParts.push(`${houseNumber}, ${road}`);
        } else if (road) {
          locationParts.push(road);
        }

        // Add suburb/area
        if (suburb && suburb !== road) {
          locationParts.push(suburb);
        }

        // Add city
        if (city) {
          locationParts.push(city);
        }

        // Add district if different from city
        if (district && district !== city && district !== state) {
          locationParts.push(district);
        }

        // Add state
        if (state) {
          locationParts.push(state);
        }

        // If we have very detailed info, use it; otherwise fall back to display_name parsing
        let finalAddr;
        if (locationParts.length >= 2) {
          finalAddr = locationParts.join(', ') + ' 📍';
        } else {
          // Parse display_name for better formatting
          const parts = displayName.split(', ');
          if (parts.length >= 3) {
            // Take first 3-4 parts for meaningful address
            finalAddr = parts.slice(0, Math.min(4, parts.length)).join(', ') + ' 📍';
          } else {
            finalAddr = displayName + ' 📍';
          }
        }

        // Ensure we have at least city and state
        if (!finalAddr.includes(city) && !finalAddr.includes(state)) {
          finalAddr = `${city}, ${state} 📍`;
        }

        setPermanentLocation(finalAddr);
      } catch (err) {
        console.warn("Reverse geocoding failed:", err);
        setPermanentLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)} 📍`);
      }
    }, () => {
      setPermanentLocation("Location access denied 🔒");
    }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 300000 }); // 15s timeout, 5min cache
  }

  const setPermanentLocation = (address) => {
    setCurrentLocation(address);
    localStorage.setItem("savedLocation", address);
  }

  const isValidJwt = (token) => {
    return typeof token === 'string' && token.split('.').length === 3 && token !== 'undefined' && token !== 'null';
  };

  useEffect(() => {
    const savedLoc = localStorage.getItem("savedLocation");
    const savedCoords = localStorage.getItem("savedLocationCoords");

    if (savedLoc) {
      setCurrentLocation(savedLoc);
    }

    if (savedCoords) {
      try {
        setLocationCoords(JSON.parse(savedCoords));
      } catch (err) {
        console.error("Invalid saved coords", err);
      }
    }

    if (!savedLoc && !savedCoords) {
      // Agar pehli baar khul raha hai toh detect karo
      detectLocationSmart();
    }
    
    const storedToken = localStorage.getItem("token");
    if (storedToken && isValidJwt(storedToken)) {
      setToken(storedToken);
    } else if (storedToken) {
      localStorage.removeItem("token");
      setToken("");
    }
  }, [setToken, setLocationCoords]); 

  // --- 🔍 2. FREE SEARCH SUGGESTIONS ---
  const fetchSuggestions = async (query) => {
    if (query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}+Roorkee+Uttarakhand&addressdetails=1&limit=5`);
      const data = await res.json();
      setSuggestions(data);
      setShowSuggestions(true);
    } catch (error) {
      console.log("Suggestions fetch failed");
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDetailedAddress(prev => ({ ...prev, [name]: value }));

    if (name === "area") {
      fetchSuggestions(value);
    }
  }

  const selectSuggestion = (item) => {
    setDetailedAddress(prev => ({
      ...prev,
      area: item.display_name,
      city: item.address.city || item.address.town || "Roorkee",
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon)
    }));
    setShowSuggestions(false); 
  }

  // --- ✍️ 3. MANUAL SUBMIT ---
  const handleManualSubmit = async (e) => {
    e.preventDefault();
    const { houseNo, area, landmark, city, latitude, longitude } = detailedAddress;
    
    if (houseNo.trim() !== "" && area.trim() !== "") {
      const landmarkStr = landmark ? ` (Near ${landmark}),` : "";
      const fullCustomAddress = `${houseNo}, ${area}${landmarkStr} ${city} 📍`;
      setPermanentLocation(fullCustomAddress);

      let coords = { lat: latitude, lng: longitude };
      const isDefaultCoords = latitude === 29.8543 && longitude === 77.8880;
      if ((!latitude || !longitude) || isDefaultCoords) {
        try {
          const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(`${houseNo} ${area} ${city}`)}&limit=1`);
          const geoData = await geoRes.json();
          if (geoData?.length > 0) {
            coords = { lat: parseFloat(geoData[0].lat), lng: parseFloat(geoData[0].lon) };
          }
        } catch (err) {
          console.warn("Geocoding failed, using current coordinates", err);
        }
      }

      if (coords.lat && coords.lng) {
        setLocationCoords(coords);
      }

      setShowLocationModal(false);
      setDetailedAddress({ houseNo: "", area: "", landmark: "", city: "Roorkee", latitude: 29.8543, longitude: 77.8880 });
    } else {
      alert("Please fill House No. and Area fields!");
    }
  }

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName"); 
    localStorage.removeItem("isLoggedIn");
    setToken("");
    navigate("/");
    window.location.reload(); 
  }

  return (
    <>
      <div className='navbar'>
        <div className='navbar-left' style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
           <Link to='/'> <img src={assets.logo} alt="" className='logo' /></Link>
           
           <div onClick={() => setShowLocationModal(true)} style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              backgroundColor: '#f4f4f4', padding: '5px 12px',
              borderRadius: '20px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', color: 'tomato',
              maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
           }}>
             <p>{currentLocation}</p>
           </div>
        </div>

        <ul className="navbar-menu">
          <Link to='/' onClick={() => setMenu('home')} className={menu === 'home' ? 'active' : ''}>home</Link>
          <a href='#explore-menu' onClick={() => setMenu('menu')} className={menu === 'menu' ? 'active' : ''}>menu</a>
          <a href='#app-download' onClick={() => setMenu('mobile-app')} className={menu === 'mobile-app' ? 'active' : ''}>mobile-app</a>
          <a href='#footer' onClick={() => setMenu('contact-us')} className={menu === 'contact-us' ? 'active' : ''}>contact us</a>
        </ul>
        
        <div className="navbar-right">
          <img src={assets.search_icon} alt="" />
          <div className="navbar-search-icon">
            <Link to='/cart'><img src={assets.basket_icon} alt="" /></Link>
            <div className={getTotalCartAmount() === 0 ? '' : 'dot'}></div>
          </div>
          
          {!isLoggedIn ? (
            <button onClick={() => setShowLogin(true)}>sign in</button>
          ) : (
            <div className='navbar-profile'>
              <img src={assets.profile_icon} alt="" style={{cursor: 'pointer'}} />
              <span style={{marginLeft:'10px', fontWeight:'600', textTransform:'capitalize'}}>{storedUserName || 'Account'}</span>
              <ul className="nav-profile-dropdown">
                <li onClick={() => navigate('/myorders')}><img src={assets.bag_icon} alt="" /><p>Orders</p></li>
                <hr />
                <li onClick={logout}><img src={assets.logout_icon} alt="" /><p>Logout</p></li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {showLocationModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000,
          display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <div style={{
            backgroundColor: 'white', padding: '25px', borderRadius: '8px',
            width: '90%', maxWidth: '420px', position: 'relative'
          }}>
            <span 
              onClick={() => setShowLocationModal(false)}
              style={{position: 'absolute', top: '10px', right: '15px', cursor: 'pointer', fontSize: '20px', fontWeight: 'bold'}}
            >
              ×
            </span>

            <h3 style={{marginBottom: '15px', color: '#49557e', textAlign: 'center'}}>Select Delivery Location</h3>

            <button 
              onClick={detectLocationSmart}
              style={{
                width: '100%', padding: '12px', backgroundColor: 'tomato',
                color: 'white', border: 'none', borderRadius: '4px',
                cursor: 'pointer', fontWeight: 'bold', marginBottom: '15px', fontSize: '14px'
              }}
            >
              🎯 Use My Current Location
            </button>

            <p style={{color: '#777', fontSize: '14px', marginBottom: '15px', textAlign: 'center'}}>-- OR --</p>

            <form onSubmit={handleManualSubmit}>
              <div style={{marginBottom: '10px'}}>
                <label style={{fontSize: '12px', fontWeight: 'bold', color: '#555'}}>House / Flat / Floor No.</label>
                <input required type="text" name="houseNo" placeholder="e.g. Hostel No. 3, Room 402" value={detailedAddress.houseNo} onChange={handleInputChange} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', marginTop: '3px', boxSizing: 'border-box' }} />
              </div>

              <div style={{marginBottom: '10px', position: 'relative'}}>
                <label style={{fontSize: '12px', fontWeight: 'bold', color: '#555'}}>Street / Area / Locality</label>
                <input required type="text" name="area" placeholder="Start typing (e.g. RIT, Roorkee)" value={detailedAddress.area} onChange={handleInputChange} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', marginTop: '3px', boxSizing: 'border-box' }} />
                
                {showSuggestions && suggestions.length > 0 && (
                  <ul style={{
                    position: 'absolute', top: '100%', left: 0, width: '100%',
                    backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '4px',
                    listStyle: 'none', padding: 0, margin: 0, zIndex: 3000, maxHeight: '150px', overflowY: 'auto'
                  }}>
                    {suggestions.map((item, index) => (
                      <li 
                        key={index} 
                        onClick={() => selectSuggestion(item)}
                        style={{ padding: '8px 12px', cursor: 'pointer', fontSize: '12px', borderBottom: '1px solid #eee', color: '#333' }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f9f9f9'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                      >
                        {item.display_name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div style={{marginBottom: '10px'}}>
                <label style={{fontSize: '12px', fontWeight: 'bold', color: '#555'}}>Landmark (Optional)</label>
                <input type="text" name="landmark" placeholder="e.g. Near Library" value={detailedAddress.landmark} onChange={handleInputChange} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', marginTop: '3px', boxSizing: 'border-box' }} />
              </div>

              <div style={{marginBottom: '15px'}}>
                <label style={{fontSize: '12px', fontWeight: 'bold', color: '#555'}}>City</label>
                <input required type="text" name="city" placeholder="e.g. Roorkee" value={detailedAddress.city} onChange={handleInputChange} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', marginTop: '3px', boxSizing: 'border-box' }} />
              </div>

              <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#49557e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>
                Save & Set Address
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default Navbar