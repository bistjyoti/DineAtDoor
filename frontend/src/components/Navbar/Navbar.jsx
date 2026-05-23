import React, { useContext, useState, useEffect } from 'react'
import './Navbar.css'
import { assets } from '../../assets/assets';
import { Link, useNavigate } from 'react-router-dom'
import { StoreContext } from '../context/StoreContext';

const Navbar = ({ setShowLogin }) => {

  const isValidJwt = (token) => {
    return typeof token === 'string' && token.split('.').length === 3 && token !== 'undefined' && token !== 'null';
  };

  const [menu, setMenu] = useState('home');
  const { getTotalCartAmount, token, setToken, currentLocation, setCurrentLocation, setLocationCoords } = useContext(StoreContext);
  const storedToken = localStorage.getItem("token");
  const isLoggedIn = !!token || isValidJwt(storedToken || "");
  const storedUserName = localStorage.getItem("userName") || "";
  const navigate = useNavigate();

  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationStatus, setLocationStatus] = useState("idle");
  const [locationHelpText, setLocationHelpText] = useState("");
  
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

  const reverseGeocode = async (latitude, longitude) => {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&extratags=1`);
    const data = await res.json();
    const address = data.address || {};
    const displayName = data.display_name || '';

    const houseNumber = address.house_number || '';
    const road = address.road || address.pedestrian || address.path || '';
    const suburb = address.suburb || address.neighbourhood || address.residential || '';
    const city = address.city || address.town || address.village || address.municipality || "Roorkee";
    const district = address.county || address.state_district || '';
    const state = address.state || "Uttarakhand";

    let locationParts = [];
    if (houseNumber && road) locationParts.push(`${houseNumber}, ${road}`);
    else if (road) locationParts.push(road);
    if (suburb && suburb !== road) locationParts.push(suburb);
    if (city) locationParts.push(city);
    if (district && district !== city && district !== state) locationParts.push(district);
    if (state) locationParts.push(state);

    if (locationParts.length >= 2) return `${locationParts.join(', ')} 📍`;
    const parts = displayName.split(', ');
    if (parts.length >= 3) return `${parts.slice(0, Math.min(4, parts.length)).join(', ')} 📍`;
    return `${displayName || `${city}, ${state}`} 📍`;
  };

  const applyLiveCoords = async (latitude, longitude) => {
    setLocationCoords({ lat: latitude, lng: longitude });
    try {
      const finalAddr = await reverseGeocode(latitude, longitude);
      setPermanentLocation(finalAddr);
      setLocationHelpText("Live location updated successfully.");
    } catch (err) {
      console.warn("Reverse geocoding failed:", err);
      setPermanentLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)} 📍`);
      setLocationHelpText("Live coordinates captured. Address lookup was limited.");
    }
    setShowLocationModal(false);
  };

  const tryIpBasedFallback = async () => {
    try {
      const ipRes = await fetch("https://ipapi.co/json/");
      const ipData = await ipRes.json();
      if (ipData?.latitude && ipData?.longitude) {
        await applyLiveCoords(Number(ipData.latitude), Number(ipData.longitude));
        setLocationStatus("granted");
        setLocationHelpText("Approximate live location detected via network.");
        return true;
      }
    } catch (e) {
      console.warn("IP fallback failed:", e);
    }
    return false;
  };

  // --- 🎯 1. DYNAMIC AUTO DETECT (Ab ye puri duniya mein har jagah kaam karega!) ---
  const detectLocationSmart = async () => {
    setLocationStatus("detecting");
    setLocationHelpText("");
    setCurrentLocation("Detecting live location... ⏳");

    if (!navigator.geolocation) {
      setLocationStatus("denied");
      setCurrentLocation("Location unsupported - use manual address 📍");
      setLocationHelpText("Your browser does not support geolocation. Please set location manually.");
      return;
    }

    // Check permission state first so we can show correct UX.
    if (navigator.permissions?.query) {
      try {
        const permission = await navigator.permissions.query({ name: "geolocation" });
        if (permission.state === "denied") {
          setLocationStatus("denied");
          setCurrentLocation("Location blocked - allow in browser settings 🔒");
          setLocationHelpText("Location access is blocked for this site. Please click the lock icon near URL -> Site settings -> Allow location, then retry.");
          return;
        }
      } catch (err) {
        console.warn("Permission query failed:", err);
      }
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      setLocationStatus("granted");
      await applyLiveCoords(latitude, longitude);
    }, (error) => {
      setLocationStatus("denied");
      if (error?.code === 1) {
        setCurrentLocation("Location blocked - choose manual or allow access 🔒");
        setLocationHelpText("Location permission is blocked. Allow location in browser settings or use manual address.");
      } else if (error?.code === 2) {
        setCurrentLocation("Trying network-based location... ⏳");
        setLocationHelpText("Device GPS unavailable. Trying approximate live location via network.");
        tryIpBasedFallback().then((ok) => {
          if (!ok) {
            setCurrentLocation("Location unavailable - try manual address 📍");
            setLocationHelpText("Could not fetch location automatically. Please use manual address.");
          }
        });
      } else {
        setCurrentLocation("Location timeout - trying fallback... ⏳");
        setLocationHelpText("GPS request timed out. Trying approximate network location.");
        tryIpBasedFallback().then((ok) => {
          if (!ok) {
            setCurrentLocation("Location timeout - try again or use manual 📍");
            setLocationHelpText("Location request timed out. Please retry or enter address manually.");
          }
        });
      }
    }, { enableHighAccuracy: false, timeout: 25000, maximumAge: 600000 });
  }

  const setPermanentLocation = (address) => {
    setCurrentLocation(address);
    localStorage.setItem("savedLocation", address);
  }

  useEffect(() => {
    const savedLoc = localStorage.getItem("savedLocation");
    const savedCoords = localStorage.getItem("savedLocationCoords");
    const hasFailedLocationText = (value = "") => {
      const v = value.toLowerCase();
      return (
        v.includes("location access denied") ||
        v.includes("location blocked") ||
        v.includes("location unavailable") ||
        v.includes("location timeout") ||
        v.includes("detecting")
      );
    };

    if (savedLoc && !hasFailedLocationText(savedLoc)) {
      setCurrentLocation(savedLoc);
    } else if (savedLoc && hasFailedLocationText(savedLoc)) {
      localStorage.removeItem("savedLocation");
      setCurrentLocation("Set delivery location 📍");
    }

    if (savedCoords) {
      try {
        setLocationCoords(JSON.parse(savedCoords));
      } catch (err) {
        console.error("Invalid saved coords", err);
      }
    }

    if ((!savedLoc || hasFailedLocationText(savedLoc)) && !savedCoords) {
      // Auto-detect on load mat karo; user click par permission prompt trigger hoga.
      setCurrentLocation("Set delivery location 📍");
    }
    
    const tokenFromStorage = localStorage.getItem("token");
    if (tokenFromStorage && isValidJwt(tokenFromStorage)) {
      setToken(tokenFromStorage);
    } else if (tokenFromStorage) {
      localStorage.removeItem("token");
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("userName");
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

      setLocationStatus("manual");
      setLocationHelpText("Manual address saved.");
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
            {locationHelpText && (
              <p style={{fontSize: '12px', marginBottom: '10px', color: locationStatus === "denied" ? '#d9534f' : '#4a5568'}}>
                {locationHelpText}
              </p>
            )}

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