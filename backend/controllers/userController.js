import userModel from "../models/userModel.js";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import validator from 'validator'

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key'

//login user
const loginUser = async (req,res) =>{
    const {email, password} = req.body;
    try {
        const user = await userModel.findOne({email});

        if(!user){
           return res.json({success:false, message:'User does not exist'}) 
        }

        const isMatch = await bcrypt.compare(password,user.password)

        if(!isMatch){
            return res.json({success:false, message:'Invalid credentials'})
        }

        const token = createToken(user._id);
        res.json({success:true, token, user:{name:user.name, email:user.email, faceRegistered: !!user.faceImage}})
    } catch (error) {
        console.log(error)
        res.json({success:false, message:'Server error during login'})
    }
}

const createToken = (id) =>{
    return jwt.sign({id},JWT_SECRET, { expiresIn: '7d' })
}

//register user
const registerUser = async (req, res) =>{
    const {name,password,email, faceImage} = req.body;
    try {

        // checking is user already exists
        const exists = await userModel.findOne({email});
        if(exists){
            return res.json({success:false, message:'User already exists'})
        }

        //validating email format and strong password
        if(!validator.isEmail(email)){
            return res.json({success:false, message:'Please enter a valid email'})
        }

        if(password.length<8){
            return res.json({success:false, message:'Please enter a strong password'})
        }

        if(!faceImage){
            return res.json({success:false, message:'Face capture is required for secure signup'})
        }

        // hashing user password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password,salt);

        const newUser = new userModel({
            name:name,
            email:email,
            password:hashedPassword,
            faceImage: faceImage
        })

      const user =  await newUser.save()
      const token = createToken(user._id)
      res.json({success:true, token, user:{name:user.name, email:user.email, faceRegistered: !!user.faceImage}})

    } catch (error) {
        console.log(error)
        res.json({success:false, message:'Server error during registration'})
    }
}

const getUserProfile = async (req, res) => {
    try {
        const user = await userModel.findById(req.body.userId).select('-password');
        if(!user) {
            return res.json({success:false, message:'User not found'})
        }
        res.json({success:true, data:{name:user.name, email:user.email, faceRegistered: !!user.faceImage}})
    } catch (error) {
        console.log(error)
        res.json({success:false, message:'Server error fetching profile'})
    }
}

const compareFaceImages = (storedImage, currentImage) => {
    if (!storedImage || !currentImage) return false;
    const stripPrefix = (value) => value.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
    const a = stripPrefix(storedImage);
    const b = stripPrefix(currentImage);
    if (a.length === 0 || b.length === 0) return false;

    const minLen = Math.min(a.length, b.length);
    let sameChars = 0;
    for (let i = 0; i < Math.min(1000, minLen); i++) {
        if (a[i] === b[i]) sameChars++;
    }
    return (sameChars / Math.min(1000, minLen)) > 0.8;
}

const verifyFace = async (req, res) => {
    const { faceImage } = req.body;
    try {
        const user = await userModel.findById(req.body.userId);
        if (!user || !user.faceImage) {
            return res.json({success:false, message:'No face data registered for this account'})
        }
        if (!faceImage) {
            return res.json({success:false, message:'Please provide face data for verification'})
        }

        const isMatch = compareFaceImages(user.faceImage, faceImage);
        if (!isMatch) {
            return res.json({success:false, message:'Face does not match registered user'})
        }

        res.json({success:true, message:'Face verified successfully'})
    } catch (error) {
        console.log(error)
        res.json({success:false, message:'Server error during face verification'})
    }
}

export {loginUser, registerUser, getUserProfile, verifyFace}