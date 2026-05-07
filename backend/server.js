import express from 'express'
import cors from 'cors'
import { connectDB } from './config/db.js'
import foodRouter from './routes/foodRoute.js'
import userRouter from './routes/userRoute.js'
import cartRouter from './routes/cartRoute.js'
import orderRouter from './routes/orderRoute.js'
import restaurantRouter from './routes/restaurantRoute.js' 
import 'dotenv/config'

// app config
const app = express()
const port = 4000

// middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cors())         


app.use("/api/food", foodRouter)
app.use("/api/user", userRouter)
app.use("/api/cart", cartRouter)
app.use("/api/order", orderRouter)
app.use("/api/restaurant", restaurantRouter) 
app.use("/images", express.static('uploads'))

app.get("/", (req, res) => {
    res.send("API working")
})

async function startServer() {
    try {
        await connectDB() 
        const server = app.listen(port, () => {
            console.log(`Server started on http://localhost:${port} 🚀`)
            console.log("DineAtDoor is ready for action! ✅")
        })

        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.error(`❌ Port ${port} pehle se busy hai. Isse terminal se kill karo ya port change karo.`)
            } else {
                console.error('Server error:', err)
            }
            process.exit(1)
        })
    } catch (err) {
        console.log("Server Startup Error ❌:", err.message)
    }
}

startServer()