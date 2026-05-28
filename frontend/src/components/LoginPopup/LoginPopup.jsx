import React, { useContext, useState, useEffect, useRef } from 'react'
import axios from 'axios'
import * as faceapi from 'face-api.js' 
import './LoginPopup.css'
import { assets } from '../../assets/assets'
import { StoreContext } from '../context/StoreContext'
import { useNavigate } from 'react-router-dom'

const LoginPopup = ({ setShowLogin }) => {
    const { url, setToken, setUserRole } = useContext(StoreContext)
    const [currState, setCurrState] = useState("Sign Up")
    const navigate = useNavigate();
    const [data, setData] = useState({ name: "", email: "", password: "" })
    
    const [isProcessing, setIsProcessing] = useState(false)
    const [faceCaptured, setFaceCaptured] = useState(false)
    const [modelsLoaded, setModelsLoaded] = useState(false)
    
    const [capturedImageBase64, setCapturedImageBase64] = useState("")
    const faceDescriptorRef = useRef([])
    const videoRef = useRef(null)

    useEffect(() => {
        const loadModelsAndCamera = async () => {
            try {
                const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
                await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
                await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
                await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
                setModelsLoaded(true);

                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) videoRef.current.srcObject = stream;
            } catch (error) {
                console.error("Setup failed:", error);
            }
        };
        loadModelsAndCamera();

        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const tracks = videoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            }
        }
    }, []);

    useEffect(() => {
        setFaceCaptured(false);
        setCapturedImageBase64("");
        faceDescriptorRef.current = [];
    }, [currState]);

    const onChangeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setData(prevData => ({ ...prevData, [name]: value }));
    }

    const captureFace = async () => {
        if (!videoRef.current || !modelsLoaded) {
            alert("Camera or Face models are not ready!");
            return;
        }
        
        setIsProcessing(true);
        setFaceCaptured(false);
        
        try {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            
            const base64Data = canvas.toDataURL('image/png');

            const detection = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.5 })).withFaceLandmarks().withFaceDescriptor();
            
            if (!detection) {
                alert("Face not detected clearly! Please adjust your lighting and try again.");
                setIsProcessing(false);
                return;
            }

            setCapturedImageBase64(base64Data);
            faceDescriptorRef.current = Array.from(detection.descriptor);
            
            setFaceCaptured(true);
            setIsProcessing(false);
        } catch (err) {
            console.error(err);
            setIsProcessing(false);
        }
    }

    const dataURLtoBlob = (dataurl) => {
        let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], {type:mime});
    }

    const onLogin = async (event) => {
        event.preventDefault();
        
        if (!faceCaptured || !capturedImageBase64) {
            return alert("Please verify your face first!");
        }

        const userEmail = data.email.trim();
        const userPassword = data.password;
        const userName = data.name;

        const formData = new FormData();
        formData.append("email", userEmail);
        formData.append("password", userPassword);
        
        if (currState === "Sign Up") {
            formData.append("name", userName);
        }

        const imageBlob = dataURLtoBlob(capturedImageBase64);
        formData.append("image", imageBlob, "face_snapshot.png"); 
        
        formData.append("faceDescriptor", JSON.stringify(faceDescriptorRef.current));
        formData.append("currentFaceDescriptor", JSON.stringify(faceDescriptorRef.current));

        const endpoint = currState === "Sign Up" ? "/api/user/register" : "/api/user/login";
        
        try {
            const response = await axios.post(url + endpoint, formData, {
                headers: { 
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
              
                localStorage.setItem("token", response.data.token);
                setToken(response.data.token);
                setUserRole("user");
                setShowLogin(false);
                navigate('/');
            } else {
                alert(response.data.message);
            }
        } catch (error) {
            console.error(error);
            alert("Connection error occurred during sync");
        }
    }

    return (
        <div className='login-popup'>
            <form onSubmit={onLogin} className="login-popup-container">
                <div className="login-popup-title">
                    <h2>{currState}</h2>
                    <img onClick={() => setShowLogin(false)} src={assets.cross_icon} alt="Close" loading="lazy" />
                </div>
                
                <div className="login-popup-inputs">
                    {currState === "Sign Up" && (
                        <input 
                            name='name' 
                            value={data.name} 
                            onChange={onChangeHandler} 
                            type="text" 
                            placeholder='Your name' 
                            required 
                        />
                    )}
                    <input 
                        name='email' 
                        value={data.email} 
                        onChange={onChangeHandler} 
                        type="email" 
                        placeholder='Your email' 
                        required 
                    />
                    <input 
                        name='password' 
                        value={data.password} 
                        onChange={onChangeHandler} 
                        type="password" 
                        placeholder='Password' 
                        required={currState === "Sign Up"} 
                    />
                </div>

                <div className='face-capture-area' style={{padding: "10px", textAlign: "center"}}>
                    <h4>Biometric Verification</h4>
                    
                    <div style={{ position: 'relative', width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
                        {faceCaptured && capturedImageBase64 ? (
                            <img src={capturedImageBase64} alt="Captured Face" loading="lazy" style={{ width: '100%', borderRadius: '8px', border: "3px solid #28a745" }} />
                        ) : (
                            <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', borderRadius: '8px', border: "3px solid #ccc" }} />
                        )}
                    </div>

                    <button type='button' onClick={captureFace} style={{marginTop: "10px", width: "100%", padding: "10px", backgroundColor: faceCaptured ? "#28a745" : "#ff4f33", color: "white", border: "none", cursor: "pointer"}}>
                        {isProcessing ? 'Analyzing Frame...' : faceCaptured ? 'Verified ✅ (Click to Recapture)' : 'Verify My Face'}
                    </button>
                </div>

                <div className="login-popup-condition">
                    <input type="checkbox" required />
                    <p>I agree to the terms of use & privacy policy.</p>
                </div>
                
                <button type='submit' disabled={!faceCaptured} style={{ backgroundColor: !faceCaptured ? '#ccc' : 'tomato', cursor: !faceCaptured ? 'not-allowed' : 'pointer' }}>
                    {currState === "Sign Up" ? "Create account" : "Login"}
                </button>
                
                {currState === "Login"
                    ? <p>Create a new account? <span onClick={() => setCurrState("Sign Up")} style={{color: "tomato", cursor: "pointer"}}>Click here</span></p>
                    : <p>Already have an account? <span onClick={() => setCurrState("Login")} style={{color: "tomato", cursor: "pointer"}}>Login here</span></p>
                }
            </form>
        </div>
    )
}
export default LoginPopup;