import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key";

const normalizeDescriptor = (descriptor) => {
    if (!descriptor || descriptor.length === 0) return [];
    const magnitude = Math.sqrt(
        descriptor.reduce((sum, val) => sum + val * val, 0)
    );
    if (magnitude === 0) return descriptor;
    return descriptor.map(val => val / magnitude);
};

const calculateEuclideanDistance = (desc1, desc2) => {
    if (!desc1 || !desc2 || desc1.length !== desc2.length) {
        return 1.0;
    }
    let sum = 0;
    for (let i = 0; i < desc1.length; i++) {
        sum += Math.pow(desc1[i] - desc2[i], 2);
    }
    return Math.sqrt(sum);
};

const createToken = (id) => {
    return jwt.sign({ id }, JWT_SECRET, { expiresIn: "7d" });
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    
    let currentFaceDescriptor = req.body.currentFaceDescriptor || req.body.faceDescriptor;

    try {
        // Validation 1: Email toh hamesha zaroori hai taaki pata chale account kiska hai
        if (!email) {
            return res.json({ success: false, message: "Email is required" });
        }

        // Check karo user database mein hai ya nahi
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: "User does not exist" });
        }

        // 🌟 AGAR FACE SCANNED DATA AAYA HAI ➔ PASSWORD BYPASS KARO
        if (currentFaceDescriptor && user.faceDescriptor && user.faceDescriptor.length > 0) {
            
            if (typeof currentFaceDescriptor === 'string') {
                try {
                    currentFaceDescriptor = JSON.parse(currentFaceDescriptor);
                } catch (e) {
                    return res.json({ success: false, message: "Invalid face data format" });
                }
            }

            const storedDescriptor = normalizeDescriptor(user.faceDescriptor);
            const currentDescriptor = normalizeDescriptor(currentFaceDescriptor);
            
            const distance = calculateEuclideanDistance(storedDescriptor, currentDescriptor);
            console.log("LOGIN FACE DISTANCE (PASSWORD BYPASS MODE):", distance);

            const strictThreshold = 0.45; 
            if (distance > strictThreshold) {
                return res.json({ success: false, message: "Face verification failed" });
            }
            
            // Face match ho gaya! Ab bina password check kiye yahan se seedha login token bhej do
            const token = createToken(user._id);
            return res.json({
                success: true,
                token,
                user: {
                    name: user.name,
                    email: user.email,
                    faceRegistered: true
                }
            });
        } 
        
        // 🌟 AGAR FACE DATA NAHI AAYA HAI ➔ TABHI PASSWORD SE LOGIN HOGA
        else {
            if (!password) {
                return res.json({ success: false, message: "Password is required when face is not scanned" });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.json({ success: false, message: "Invalid credentials" });
            }

            const token = createToken(user._id);
            return res.json({
                success: true,
                token,
                user: {
                    name: user.name,
                    email: user.email,
                    faceRegistered: !!(user.faceDescriptor && user.faceDescriptor.length > 0)
                }
            });
        }

    } catch (error) {
        console.log("LOGIN ERROR:", error);
        res.json({ success: false, message: "Login failed" });
    }
};

const registerUser = async (req, res) => {
    const { name, password, email, faceImage } = req.body;
    let faceDescriptor = req.body.faceDescriptor;

    try {
        if (!email) {
            return res.json({ success: false, message: "Email parameter is missing or undefined" });
        }

        const exists = await userModel.findOne({ email: email.trim() });
        if (exists) {
            return res.json({ success: false, message: "User already exists" });
        }

        if (!validator.isEmail(email.trim())) {
            return res.json({ success: false, message: "Invalid email format" });
        }

        if (!password || password.length < 8) {
            return res.json({ success: false, message: "Password must be at least 8 characters" });
        }

        if (!faceDescriptor || faceDescriptor.length === 0) {
            return res.json({ success: false, message: "Face data required" });
        }


        if (typeof faceDescriptor === 'string') {
            try {
                faceDescriptor = JSON.parse(faceDescriptor);
            } catch (e) {
                return res.json({ success: false, message: "Invalid face descriptor format" });
            }
        }

        const normalizedDescriptor = normalizeDescriptor(faceDescriptor);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new userModel({
            name,
            email: email.trim(),
            password: hashedPassword,
            faceImage: faceImage || (req.file ? req.file.filename : ""),
            faceDescriptor: normalizedDescriptor
        });

        const user = await newUser.save();
        console.log("NEW USER REGISTERED:", user._id);

        const token = createToken(user._id);
        res.json({
            success: true,
            token,
            user: {
                name: user.name,
                email: user.email,
                faceRegistered: true
            }
        });

    } catch (error) {
        console.log("REGISTER ERROR:", error);
        res.json({ success: false, message: "Registration failed" });
    }
};

const getUserProfile = async (req, res) => {
    try {
        const user = await userModel.findById(req.body.userId).select("-password");
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }
        res.json({
            success: true,
            data: {
                name: user.name,
                email: user.email,
                faceRegistered: !!(user.faceDescriptor && user.faceDescriptor.length > 0)
            }
        });
    } catch (error) {
        console.log("PROFILE ERROR:", error);
        res.json({ success: false, message: "Profile fetch failed" });
    }
};

const verifyFace = async (req, res) => {
    let currentFaceDescriptor = req.body.currentFaceDescriptor || req.body.faceDescriptor;
    let userId = req.body.userId;

    try {
        if (!userId && req.headers.token) {
            const decoded = jwt.verify(req.headers.token, JWT_SECRET);
            userId = decoded.id;
        }

        if (!userId) {
            return res.json({ success: false, message: "Unauthenticated user" });
        }

        const user = await userModel.findById(userId);
        if (!user || !user.faceDescriptor) {
            return res.json({ success: false, message: "No face registered" });
        }

        if (!currentFaceDescriptor) {
            return res.json({ success: false, message: "Face scan required" });
        }

        if (typeof currentFaceDescriptor === 'string') {
            try {
                currentFaceDescriptor = JSON.parse(currentFaceDescriptor);
            } catch (e) {
                return res.json({ success: false, message: "Invalid face descriptor string" });
            }
        }

        const storedDescriptor = normalizeDescriptor(user.faceDescriptor);
        const currentDescriptor = normalizeDescriptor(currentFaceDescriptor);
        
        const distance = calculateEuclideanDistance(storedDescriptor, currentDescriptor);
        console.log("CHECKOUT FACE DISTANCE:", distance);

        const strictThreshold = 0.45;
        if (distance > strictThreshold) {
            return res.json({ success: false, suspicious: true, message: "⚠ Suspicious face detected" });
        }

        return res.json({ success: true, message: "✅ Face verified successfully" });

    } catch (error) {
        console.log("VERIFY FACE ERROR:", error);
        res.json({ success: false, message: "Face verification failed" });
    }
};

export { loginUser, registerUser, getUserProfile, verifyFace };