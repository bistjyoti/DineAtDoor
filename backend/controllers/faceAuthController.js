import userModel from './../models/userModel.js';
import bcrypt from 'bcrypt';

// Register face for user
const registerFace = async (req, res) => {
    try {
        const { userId, faceDescriptor } = req.body;

        if (!userId || !faceDescriptor) {
            return res.json({ success: false, message: 'Missing required fields' });
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        // Store face descriptor
        user.faceDescriptor = faceDescriptor;
        await user.save();

        res.json({ success: true, message: 'Face registered successfully' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: 'Error registering face' });
    }
};

// Authenticate with face
const authenticateWithFace = async (req, res) => {
    try {
        const { email, faceDescriptor } = req.body;

        if (!email || !faceDescriptor) {
            return res.json({ success: false, message: 'Missing required fields' });
        }

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        if (!user.faceDescriptor) {
            return res.json({ success: false, message: 'Face not registered for this user' });
        }

        // Compare face descriptors (simple Euclidean distance)
        const distance = calculateDistance(JSON.parse(faceDescriptor), user.faceDescriptor);
        const threshold = 0.6; // Adjust based on your needs

        if (distance < threshold) {
            const token = createToken(user._id);
            res.json({ success: true, token, message: 'Face authentication successful' });
        } else {
            res.json({ success: false, message: 'Face does not match' });
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: 'Error during face authentication' });
    }
};

// Helper function to calculate Euclidean distance
const calculateDistance = (descriptor1, descriptor2) => {
    let sum = 0;
    for (let i = 0; i < descriptor1.length; i++) {
        sum += Math.pow(descriptor1[i] - descriptor2[i], 2);
    }
    return Math.sqrt(sum);
};

const createToken = (id) => {
    return require('jsonwebtoken').sign({ id }, process.env.JWT_SECRET);
};

export { registerFace, authenticateWithFace };
