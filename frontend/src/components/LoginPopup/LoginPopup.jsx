import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import * as faceapi from 'face-api.js' 
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
    const [faceDescriptor, setFaceDescriptor] = useState([]) 
    const [cameraActive, setCameraActive] = useState(false)
    const [faceCaptured, setFaceCaptured] = useState(false)
    const [modelsLoaded, setModelsLoaded] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false) // Dynamic loader state
    const videoRef = useRef(null)
    const streamRef = useRef(null)

    // Load models securely
    useEffect(() => {
        document.body.style.overflow = "hidden"; 
        
        const loadModels = async () => {
            try {
                // Using hosted weights
                const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
                await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
                await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
                await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
                
                setModelsLoaded(true);
                console.log("Biometric tracking models active! ✅");
            } catch (error) {
                console.error("Failed to map face recognition structures:", error);
            }
        };
        
        loadModels();

        return () => { 
            document.body.style.overflow = "auto"; 
            stopCamera(); 
        };
    }, []); 

    // Sync camera context safely
    useEffect(() => {
        if (modelsLoaded) {
            startCameraPreview();
        }
        return () => stopCamera();
    }, [currState, modelsLoaded]);

    const startCameraPreview = async () => {
        stopCamera(); 
        if (!navigator.mediaDevices?.getUserMedia) return;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { width: 640, height: 480, facingMode: "user" } 
            });
            streamRef.current = stream;
            if (videoRef.current) videoRef.current.srcObject = stream;
            setCameraActive(true);
        } catch (err) {
            console.error('Camera stream access denied:', err);
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

    // 🔥 HIGH-DEF BIOMETRIC PROCESSING ENGINE WITH STRICT VALIDATION
    const captureFace = async () => {
        if (!videoRef.current || !modelsLoaded) {
            alert("Biometric algorithms are still spinning up. Give it a brief moment...");
            return;
        }

        setIsProcessing(true);
        const video = videoRef.current;
        
        try {
            // Force strict scanning parameters
            const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 });
            const detection = await faceapi.detectSingleFace(video, options)
                                            .withFaceLandmarks()
                                            .withFaceDescriptor();

            // CRITICAL CHECK: Block execution if mapping coordinates are missing!
            if (!detection || !detection.descriptor) {
                alert("❌ Scan Failed: Face not recognized clearly!\n\nTips:\n1. Stand directly under a light source (Chehre par ujala hona chahiye).\n2. Look straight into the lens without moving.\n3. Keep a clear background.");
                setIsProcessing(false);
                return;
            }

            // Bind native float array into secure transfer array
            const pureNumbersArray = Array.from(detection.descriptor).map(num => parseFloat(num));
            setFaceDescriptor(pureNumbersArray);

            // Paint standard capture canvas buffer
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth || 640;
            canvas.height = video.videoHeight || 480;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            const imageData = canvas.toDataURL('image/png');
            setFaceImage(imageData);
            setFaceCaptured(true);
            stopCamera();
            alert("Biometric Matrix Verified Successfully! 🧬✨ Ready to process secure checkout.");
        } catch (err) {
            console.error("AI Core processing error: ", err);
            alert("Processing error. Please try clicking the button again.");
        } finally {
            setIsProcessing(false);
        }
    }

    const retakeFace = () => {
        setFaceCaptured(false);
        setFaceImage("");
        setFaceDescriptor([]);
        startCameraPreview();
    }

    const onChangeHandler = (event) => {
        setData(data => ({ ...data, [event.target.name]: event.target.value }))
    }

    const isPasswordStrong = (password) => {
        return /^(?=.*[!@#$%^&*])(?=.{8,})/.test(password);
    }

    const onLogin = async (event) => {
        event.preventDefault();

        // FRONTEND VALIDATION
        if (!faceCaptured || faceDescriptor.length === 0) {
            alert('❌ Security Halt: Face biometric data mapping points are required! Please click on "Verify My Face ✨" first.');
            return;
        }

        if (currState === "Sign Up") {
            if (!isPasswordStrong(data.password)) {
                alert("❌ Password too weak!\nUse at least 8 characters and 1 special character (e.g., @, #, $)");
                return;
            }

            try {
                const response = await axios.post(`${backendUrl}/api/user/register`, {
                    name: data.name,
                    email: data.email,
                    password: data.password,
                    faceImage: faceImage,
                    faceDescriptor: faceDescriptor 
                });

                if (response.data.success) {
                    localStorage.setItem("token", response.data.token);
                    localStorage.setItem("isLoggedIn", "true");
                    localStorage.setItem("userName", response.data.user?.name || data.name);
                    alert("Account created with Anti-Fraud biometric lock enabled! 🎉");
                    setShowLogin(false);
                    window.location.reload();
                } else {
                    alert(response.data.message || "Registration failed.");
                }
            } catch (error) {
                alert(`Signup error: ${error.response?.data?.message || error.message}`);
            }
        } else {
            try {
                const response = await axios.post(`${backendUrl}/api/user/login`, {
                    email: data.email,
                    password: data.password,
                    currentFaceDescriptor: faceDescriptor 
                });

                if (response.data.success) {
                    localStorage.setItem("token", response.data.token);
                    localStorage.setItem("isLoggedIn", "true");
                    localStorage.setItem("userName", response.data.user?.name || "");
                    alert("Identity Authenticated. Logged In Successfully! ✅");
                    setShowLogin(false);
                    window.location.reload();
                } else {
                    alert(response.data.message || "Invalid account access signature.");
                }
            } catch (error) {
                alert(`Login error: ${error.response?.data?.message || error.message}`);
            }
        }
    }

    return (
        <div className='login-popup'>
            <form onSubmit={onLogin} className="login-popup-container">
                <div className="login-popup-title">
                    <h2>{currState}</h2>
                    <img onClick={() => setShowLogin(false)} src={assets.cross_icon} alt="Close" />
                </div>
                <div className="login-popup-inputs">
                    {currState === "Login" ? null : 
                        <input name='name' onChange={onChangeHandler} value={data.name} type="text" placeholder='Your name' required />
                    }
                    <input name='email' onChange={onChangeHandler} value={data.email} type="email" placeholder='Your email' required />
                    <input name='password' onChange={onChangeHandler} value={data.password} type="password" placeholder='Password' required />
                    
                    {currState === "Sign Up" && <p style={{fontSize:"10px", color:"red"}}>*Min 8 chars & 1 special char (#, @, etc.)</p>}

                    <div className='face-capture-area'>
                        <h4>{currState === "Sign Up" ? "Face registration" : "Anti-Fraud Identity Check"}</h4>
                        
                        {faceCaptured && (
                            <div style={{marginBottom:'10px'}}>
                                <img src={faceImage} alt="Face capture preview" style={{width:'100%', borderRadius:'12px', border:'2px solid #60b246'}} />
                            </div>
                        )}
                        
                        <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
                            {!faceCaptured && (
                                <video ref={videoRef} autoPlay playsInline muted style={{width:'100%', borderRadius:'12px', border:'1px solid #ddd', minHeight:'220px', background:'#000'}} />
                            )}
                            
                            <button type='button' disabled={isProcessing} onClick={faceCaptured ? retakeFace : captureFace} style={{cursor:'pointer', padding:'10px', background: faceCaptured ? '#7e808c' : '#60b246', color:'#fff', border:'none', borderRadius:'6px', fontWeight:'600'}}>
                                {isProcessing ? 'Analyzing Biometrics Engine...' : faceCaptured ? 'Retake Frame Scan' : 'Verify My Face ✨'}
                            </button>
                            
                            {!cameraActive && !faceCaptured && (
                                <p style={{fontSize:'11px', color:'#999', textAlign:'center'}}>
                                    {modelsLoaded ? "Initializing camera module context..." : "Loading premium biometric tracking weights..."}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <button type='submit' style={{marginTop:'15px'}}>{currState === "Sign Up" ? "Create account" : "Secure Login"}</button>
                
                <div className="login-popup-condition">
                    <input type="checkbox" required />
                    <p>By continuing, I agree to the terms of use & privacy policy.</p>
                </div>

                {currState === "Login"
                    ? <p>Create a new account? <span onClick={() => { setCurrState("Sign Up"); retakeFace(); }}>Click here</span></p>
                    : <p>Already have an account? <span onClick={() => { setCurrState("Login"); retakeFace(); }}>Login here</span></p>
                }
            </form>
        </div>
    )
}

export default LoginPopup