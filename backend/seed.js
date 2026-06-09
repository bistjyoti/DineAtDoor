import mongoose from "mongoose";
import foodModel from "./models/foodModel.js"; 
import dotenv from "dotenv";

dotenv.config();

const generate600Dishes = () => {
    const dishes = [];
    const categories = ["Salad", "Rolls", "Deserts", "Sandwich", "Cake", "Pure Veg", "Pasta", "Noodles"];
    
    for (let r = 1; r <= 20; r++) {
        const resId = `RES${String(r).padStart(3, '0')}`;
        for (let d = 1; d <= 30; d++) {
            dishes.push({
                name: `Res ${r} - Special Dish ${d}`,
                description: "Teacher ko khush karne wali swadisht dish, high quality ingredients se bani.",
                price: Math.floor(Math.random() * (500 - 100 + 1)) + 100,
                image: `food_${Math.floor(Math.random() * 32) + 1}.png`, 
                category: categories[Math.floor(Math.random() * categories.length)],
                restaurantId: resId
            });
        }
    }
    return dishes;
};

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Database connected for mass seeding... 🔌");

        await foodModel.deleteMany({});

        const allDishes = generate600Dishes();
        await foodModel.insertMany(allDishes);

        console.log(`Success! 600 Dishes (20 Restaurants x 30) added! ✅`);
        process.exit();
    } catch (error) {
        console.log("Seeding failed:", error);
        process.exit(1);
    }
};

seedDB();