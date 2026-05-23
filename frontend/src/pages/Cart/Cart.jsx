import React, {
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback
} from "react";

import "./Cart.css";

import axios from "axios";

import { StoreContext } from "../../components/context/StoreContext";

import { useNavigate } from "react-router-dom";

import Header from "../../components/Header/Header";
import ExploreMenu from "../../components/ExploreMenu/ExploreMenu";
import FoodDisplay from "../../components/FoodDisplay/FoodDisplay";

import * as faceapi from "face-api.js";

const Cart = ({ setShowLogin }) => {

  const {
    cartItems,
    food_list,
    removeFromCart,
    getTotalCartAmount,
    token,
    url
  } = useContext(StoreContext);

  const navigate = useNavigate();

  const videoRef = useRef(null);

  const [isScanning, setIsScanning] = useState(false);

  const [scanStatus, setScanStatus] = useState(
    "INITIALIZING FACE SYSTEM..."
  );

  const [category, setCategory] = useState("All");
  const intervalRef = useRef(null);
  const streamRef = useRef(null);
  const timeoutRef = useRef(null);
  const isProcessingRef = useRef(false);


  useEffect(() => {

    const loadModels = async () => {

      try {

        const MODEL_URL = "/models";

        console.log("LOADING FACE MODELS...");

        await faceapi.nets.tinyFaceDetector.loadFromUri(
          MODEL_URL
        );

        await faceapi.nets.faceLandmark68Net.loadFromUri(
          MODEL_URL
        );

        await faceapi.nets.faceRecognitionNet.loadFromUri(
          MODEL_URL
        );

        console.log("FACE MODELS LOADED");

      } catch (error) {

        console.log(
          "MODEL LOADING ERROR:",
          error
        );

      }

    };

    loadModels();

    return () => {

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (streamRef.current) {

        streamRef.current
          .getTracks()
          .forEach(track => track.stop());

      }

    };

  }, []);


  const stopCameraHardware = useCallback(() => {

    if (intervalRef.current) {

      clearInterval(intervalRef.current);

      intervalRef.current = null;

    }

    if (timeoutRef.current) {

      clearTimeout(timeoutRef.current);

      timeoutRef.current = null;

    }

    if (streamRef.current) {

      streamRef.current
        .getTracks()
        .forEach(track => track.stop());

      streamRef.current = null;

    }

    setIsScanning(false);

    isProcessingRef.current = false;

  }, []);


  const handleVideoPlay = () => {

    console.log("VIDEO STARTED");

    setScanStatus("LOOK STRAIGHT AT CAMERA");

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(async () => {

      try {

        if (
          !videoRef.current ||
          videoRef.current.paused ||
          videoRef.current.ended ||
          isProcessingRef.current
        ) {
          return;
        }

        const video = videoRef.current;

        if (
          video.readyState !== 4 ||
          video.videoWidth === 0 ||
          video.videoHeight === 0
        ) {
          return;
        }

        console.log("🔍 DETECTING FACE...");

        const detection = await faceapi
          .detectSingleFace(
            video,
            new faceapi.TinyFaceDetectorOptions({
              inputSize: 320,
              scoreThreshold: 0.2
            })
          )
          .withFaceLandmarks()
          .withFaceDescriptor();



        console.log("DETECTION:", detection);

        if (!detection) {

          setScanStatus(
            "NO FACE DETECTED"
          );

          return;

        }

        if (detection && !isProcessingRef.current) {

          isProcessingRef.current = true;

          clearInterval(intervalRef.current);

          clearTimeout(timeoutRef.current);

          setScanStatus(
            "VERIFYING FACE..."
          );



          const currentFaceDescriptor =
            Array.from(
              detection.faceDescriptor
            );

          try {
            const response = await axios.post(

              `${url}/api/user/verify-face`,

              {
                currentFaceDescriptor
              },

              {
                headers: {
                  token
                }
              }

            );

             console.log(
              "VERIFY RESPONSE:",
              response.data
            );



            stopCameraHardware();



            if (response.data.success) {

              alert(
                "FACE VERIFIED SUCCESSFULLY"
              );

              navigate("/order");

            } else {

              alert(
                response.data.message
              );

            }

          } catch (apiError) {

            console.log(
              " VERIFY API ERROR:",
              apiError
            );

            stopCameraHardware();

            alert(
              "Verification Failed"
            );

          }

        }

      } catch (error) {

        console.log(
          "FACE DETECTION ERROR:",
          error
        );

      }

    }, 1000);


    timeoutRef.current = setTimeout(() => {

      if (!isProcessingRef.current) {

        stopCameraHardware();

        alert(
          "Face Scan Timeout"
        );

      }

    }, 20000);

  };

  const startCamera = async () => {

    if (!token) {

      alert("Please Login First");

      if (setShowLogin) {

        setShowLogin(true);

      }

      return;

    }

    if (getTotalCartAmount() === 0) {
      return;
    }

    try {

      setIsScanning(true);

      setScanStatus("STARTING CAMERA...");



      const stream =
        await navigator.mediaDevices.getUserMedia({

          video: {
            width: 640,
            height: 480,
            facingMode: "user"
          },

          audio: false

        });



      console.log(
        "🎥 CAMERA READY:",
        stream
      );



      streamRef.current = stream;



      if (videoRef.current) {

        videoRef.current.srcObject = stream;

        await videoRef.current.play();

        console.log("VIDEO PLAYING");

      }

    } catch (error) {

      console.log(
        "CAMERA ACCESS ERROR:",
        error
      );

      alert("Camera Access Failed");

      setIsScanning(false);

    }

  };
    return (

    <div className='cart'>



      {/* FACE SCANNER */}
      {isScanning && (

        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.96)",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            backdropFilter: "blur(6px)"
          }}
        >

          <div
            style={{
              width: "400px",
              height: "400px",
              border: "4px solid cyan",
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow:
                "0 0 35px rgba(0,255,255,0.5)"
            }}
          >

            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              onLoadedMetadata={() => {

                if (videoRef.current) {
                  videoRef.current.play();
                }

              }}
              onPlay={handleVideoPlay}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                backgroundColor: "black"
              }}
            />

          </div>

          <h2
            style={{
              marginTop: "25px",
              color: "cyan",
              fontFamily: "sans-serif",
              letterSpacing: "1px"
            }}
          >
            {scanStatus}
          </h2>

        </div>

      )}

      {getTotalCartAmount() > 0 ? (

        <div className="cart-content">

          <div className="cart-items">

            <div className="cart-items-title">

              <p>Items</p>
              <p>Title</p>
              <p>Price</p>
              <p>Quantity</p>
              <p>Total</p>
              <p>Remove</p>

            </div>

            <br />

            <hr />



            {food_list.map((item, index) => {

              if (cartItems[item._id] > 0) {

                return (

                  <div key={index}>

                    <div className="cart-items-title cart-items-item">

                      <img
                        src={item.image}
                        alt=""
                      />

                      <p>{item.name}</p>

                      <p>₹{item.price}</p>

                      <p>
                        {cartItems[item._id]}
                      </p>

                      <p>
                        ₹{
                          item.price *
                          cartItems[item._id]
                        }
                      </p>

                      <p
                        className='cross'
                        style={{
                          cursor: "pointer"
                        }}
                        onClick={() =>
                          removeFromCart(item._id)
                        }
                      >
                        x
                      </p>

                    </div>

                    <hr />

                  </div>

                );

              }

              return null;

            })}

          </div>






          <div className="cart-bottom">

            <div className="cart-total">

              <h2>Cart Total</h2>

              <div className="cart-total-detail">

                <p>Subtotal</p>

                <p>
                  ₹{getTotalCartAmount()}
                </p>

              </div>

              <hr />

              <div className="cart-total-detail">

                <b>Total</b>

                <b>
                  ₹{getTotalCartAmount() + 2}
                </b>

              </div>

              <button
                onClick={startCamera}
                style={{
                  cursor: "pointer",
                  background:
                    "linear-gradient(135deg,#ff4e50,#f9d423)",
                  fontWeight: "bold"
                }}
              >
                PROCEED TO CHECKOUT
              </button>

            </div>

          </div>

        </div>

      ) : (

        <div
          style={{
            textAlign: "center",
            padding: "50px 0"
          }}
        >

          <h2>
            Your cart is empty 😋
          </h2>

          <Header />

        </div>

      )}

       {/* FOOD SECTION */}
      <div
        className="cart-menu-display"
        style={{
          marginTop: "50px"
        }}
      >

        <ExploreMenu
          category={category}
          setCategory={setCategory}
        />

        <FoodDisplay category={category} />

      </div>

    </div>

  );

};

export default Cart;