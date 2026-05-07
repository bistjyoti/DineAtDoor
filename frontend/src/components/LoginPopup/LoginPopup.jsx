import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import './LoginPopup.css'
import { assets } from '../../assets/assets'

const backendUrl = 'http://localhost:4000'

const LoginPopup = ({ setShowLogin }) => {

    const [currState, setCurrState] = useState("Sign Up")
    const [data, setData] = useState({
        name: "",
        email: "",
        password: ""
    })
    const [faceImage, setFaceImage] = useState("")
    const [cameraActive, setCameraActive] = useState(false)
    const [faceCaptured, setFaceCaptured] = useState(false)
    const videoRef = useRef(null)
    const streamRef = useRef(null)

    useEffect(() => {
        document.body.style.overflow = "hidden"; 
        return () => { document.body.style.overflow = "auto"; stopCamera(); };
    }, []); 

    useEffect(() => {
        if (currState === "Sign Up") {
            startCameraPreview();
        } else {
            stopCamera();
        }
    }, [currState]);

    const startCameraPreview = async () => {
        if (!navigator.mediaDevices?.getUserMedia) {
            alert('Camera is not supported by your browser.');
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            streamRef.current = stream;
            if (videoRef.current) videoRef.current.srcObject = stream;
            setCameraActive(true);
        } catch (err) {
            console.error('Camera start failed:', err);
            alert('Please allow camera access to register your face.');
            setCameraActive(false);
        }
    }

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setCameraActive(false);
    }

    const captureFace = () => {
        if (!videoRef.current) return;
        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 320;
        canvas.height = video.videoHeight || 240;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/png');
        setFaceImage(imageData);
        setFaceCaptured(true);
        stopCamera();
    }

    const retakeFace = () => {
        setFaceCaptured(false);
        setFaceImage("");
        startCameraPreview();
    }

    const onChangeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setData(data => ({ ...data, [name]: value }))
    }

    // --- PASSWORD STRENGTH CHECK ---
    const isPasswordStrong = (password) => {
        // Criteria: Min 8 chars, 1 special char (#, @, $, etc.)
        const regex = /^(?=.*[!@#$%^&*])(?=.{8,})/;
        return regex.test(password);
    }

    const onLogin = async (event) => {
        event.preventDefault();

        if (currState === "Sign Up") {
            // 1. Sign Up Logic
            if (!isPasswordStrong(data.password)) {
                alert("❌ Password too weak!\nUse at least 8 characters and 1 special character (e.g., @, #, $)");
                return;
            }

            if (!faceCaptured || !faceImage) {
                alert('Please capture your face before creating the account.');
                return;
            }

            try {
                const response = await axios.post(`${backendUrl}/api/user/register`, {
                    name: data.name,
                    email: data.email,
                    password: data.password,
                    faceImage: faceImage
                });

                if (response.data.success) {
                    localStorage.setItem("token", response.data.token);
                    localStorage.setItem("isLoggedIn", "true");
                    localStorage.setItem("userName", response.data.user?.name || data.name);
                    alert("Account created and logged in successfully! 🎉");
                    setShowLogin(false);
                    window.location.reload();
                } else {
                    alert(response.data.message || "Registration failed.");
                }
            } catch (error) {
                console.error('Signup error:', error.response?.data || error.message || error);
                const serverMessage = error.response?.data?.message || error.message || 'Server error during signup. Please try again.';
                alert(`Signup failed: ${serverMessage}`);
            }
        } else {
            // 2. Login Logic
            try {
                const response = await axios.post(`${backendUrl}/api/user/login`, {
                    email: data.email,
                    password: data.password,
                });

                if (response.data.success) {
                    localStorage.setItem("token", response.data.token);
                    localStorage.setItem("isLoggedIn", "true");
                    localStorage.setItem("userName", response.data.user?.name || "");
                    alert("Logged In Successfully! ✅");
                    setShowLogin(false);
                    window.location.reload();
                } else {
                    alert(response.data.message || "Invalid Email or Password!");
                }
            } catch (error) {
                console.error('Login error:', error.response?.data || error.message || error);
                const serverMessage = error.response?.data?.message || error.message || 'Server error during login. Please try again.';
                alert(`Login failed: ${serverMessage}`);
            }
        }
    }

    return (
        <div className='login-popup'>
            <form onSubmit={onLogin} className="login-popup-container">
                <div className="login-popup-title">
                    <h2>{currState}</h2>
                    <img onClick={() => setShowLogin(false)} src={assets.cross_icon} alt="" />
                </div>
                <div className="login-popup-inputs">
                    {currState === "Login" ? <></> : 
                        <input name='name' onChange={onChangeHandler} value={data.name} type="text" placeholder='Your name' required />
                    }
                    <input name='email' onChange={onChangeHandler} value={data.email} type="email" placeholder='Your email' required />
                    <input name='password' onChange={onChangeHandler} value={data.password} type="password" placeholder='Password' required />
                    
                    {/* Chota sa hint user ke liye */}
                    {currState === "Sign Up" && <p style={{fontSize:"10px", color:"red"}}>*Min 8 chars & 1 special char (#, @, etc.)</p>}

                    {currState === "Sign Up" && (
                        <div className='face-capture-area'>
                            <h4>Face registration</h4>
                            {faceCaptured ? (
                                <div style={{marginBottom:'10px'}}>
                                    <img src={faceImage} alt="Face capture" style={{width:'100%', borderRadius:'12px'}} />
                                </div>
                            ) : null}
                            <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
                                <video ref={videoRef} autoPlay playsInline style={{width:'100%', borderRadius:'12px', border:'1px solid #ddd', minHeight:'220px', background:'#000'}} />
                                <button type='button' onClick={faceCaptured ? retakeFace : captureFace} style={{cursor:'pointer'}}>
                                    {faceCaptured ? 'Retake Face' : 'Capture Face'}
                                </button>
                                {!cameraActive && !faceCaptured && <p style={{fontSize:'12px', color:'#666'}}>Allow camera access to capture your face for secure registration.</p>}
                            </div>
                        </div>
                    )}
                </div>

                <button type='submit'>{currState === "Sign Up" ? "Create account" : "Login"}</button>
                
                <div className="login-popup-condition">
                    <input type="checkbox" required />
                    <p>By continuing, I agree to the terms of use & privacy policy.</p>
                </div>

                {currState === "Login"
                    ? <p>Create a new account? <span onClick={() => setCurrState("Sign Up")}>Click here</span></p>
                    : <p>Already have an account? <span onClick={() => setCurrState("Login")}>Login here</span></p>
                }
            </form>
        </div>
    )
}

export default LoginPopup