import express from 'express'
import cors from 'cors'
import { connectDB } from './config/db.js'
import foodRouter from './routes/foodRoute.js'
import userRouter from './routes/userRoute.js'
import cartRouter from './routes/cartRoute.js'
import orderRouter from './routes/orderRoute.js'
import restaurantRouter from './routes/restaurantRoute.js' 
import donationRouter from './routes/donationRoutes.js' // NGO wala change 1
import 'dotenv/config'

const app = express()
const port = process.env.PORT || 4000 

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cors())        

app.use("/api/food", foodRouter)
app.use("/api/user", userRouter)
app.use("/api/cart", cartRouter)
app.use("/api/order", orderRouter)
app.use("/api/restaurant", restaurantRouter) 
app.use("/api/donations", donationRouter) // NGO wala change 2
app.use("/images", express.static('uploads'))

app.get("/", (req, res) => {
    res.send("API working")
})

const startServer = async () => {
    try {
        await connectDB() 
        app.listen(port, () => {
            console.log(`Server started on http://localhost:${port}`)
            console.log("DineAtDoor is ready for action! ✅")
        })
    } catch (err) {
        console.error("Server Startup Error:", err.message)
        process.exit(1)
    }
}

startServer()