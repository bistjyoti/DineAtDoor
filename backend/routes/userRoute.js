import express from 'express'
import { loginUser, registerUser, getUserProfile, verifyFace } from '../controllers/userController.js'
import authMiddleware from '../middleware/auth.js'
import multer from 'multer' 

const userRouter = express.Router();
const storage = multer.diskStorage({
    filename: function (req, file, callback) {
        callback(null, `${Date.now()}_${file.originalname}`);
    }
});
const upload = multer({ storage: storage });

userRouter.post('/register', upload.single('image'), registerUser)
userRouter.post('/login', upload.single('image'), loginUser)

userRouter.get('/profile', authMiddleware, getUserProfile)
userRouter.post('/face/verify', authMiddleware, verifyFace)

export default userRouter;