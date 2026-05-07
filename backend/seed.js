import mongoose from "mongoose";
import restaurantModel from "./models/restaurantModel.js";
import foodModel from "./models/foodModel.js";
import { connectDB } from "./config/db.js";

const seedData = async () => {
    try {
        await connectDB();

        // Pehle purana data saaf karte hain (Safe side ke liye)
        await restaurantModel.deleteMany({});
        await foodModel.deleteMany({});

        // 1. Kuch Top Restaurants add karte hain (Roorkee touch ke saath)
        const restaurants = await restaurantModel.insertMany([
            {
                name: "Royal Heritage",
                description: "Best North Indian and Biryani in Civil Lines",
                location: "Civil Lines, Roorkee",
                cuisine: ["North Indian", "Mughlai"],
                rating: 4.5,
                image: "https://example.com/res1.jpg"
            },
            {
                name: "Chatpata Corner",
                description: "Famous for namkeen mixture, onions, and tomato snacks",
                location: "Near Hostel Gate, Roorkee",
                cuisine: ["Street Food", "Snacks"],
                rating: 4.2,
                image: "https://example.com/res2.jpg"
            }
        ]);

        // 2. Ab in restaurants ke liye Dishes add karte hain
        await foodModel.insertMany([
            {
                name: "Special Chatpata Mixture",
                description: "Freshly mixed namkeens with onion, tomato, and cucumber",
                price: 60,
                image: "https://example.com/dish1.jpg",
                category: "Snacks",
                restaurantId: restaurants[1]._id // Chatpata Corner se link kiya
            },
            {
                name: "Hyderabadi Biryani",
                description: "Slow-cooked aromatic basmati rice with spices",
                price: 250,
                image: "https://example.com/dish2.jpg",
                category: "Main Course",
                restaurantId: restaurants[0]._id // Royal Heritage se link kiya
            }
        ]);

        console.log("Data Seeded Successfully! 🌱");
        process.exit();
    } catch (error) {
        console.error("Error seeding data:", error);
        process.exit(1);
    }
};

seedData();