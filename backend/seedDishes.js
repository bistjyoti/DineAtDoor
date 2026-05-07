import mongoose from 'mongoose';
// Aapke models ke sahi naam yahan hain:
import restaurantModel from './models/restaurantModel.js'; 
import foodModel from './models/foodModel.js'; 


const MONGO_URI = "mongodb://bistjyoti:jyoti1234@ac-lg8wzso-shard-00-00.a9bwasv.mongodb.net:27017,ac-lg8wzso-shard-00-01.a9bwasv.mongodb.net:27017,ac-lg8wzso-shard-00-02.a9bwasv.mongodb.net:27017/?ssl=true&replicaSet=atlas-9h4vax-shard-0&authSource=admin&appName=DineAtDoor"
const seedData = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB... 🚀");

        const allRestaurants = await restaurantModel.find({});
        
        if (allRestaurants.length === 0) {
            console.log("Koi restaurants nahi mile database mein!");
            return;
        }

        // Sabse pehle purana food data clear karte hain
        await foodModel.deleteMany({});

        const sampleDishes = [
            { name: "Paneer Butter Masala", price: 250, description: "Creamy and rich paneer dish", category: "Veg", image: "food_1.png" },
            { name: "Chicken Biryani", price: 350, description: "Authentic Hyderabadi Biryani", category: "Non-Veg", image: "food_2.png" },
            { name: "Garlic Naan", price: 60, description: "Soft clay oven bread", category: "Veg", image: "food_3.png" },
            { name: "Cold Coffee", price: 120, description: "Refreshing iced coffee", category: "Beverages", image: "food_4.png" }
        ];

        let finalDishes = [];

        allRestaurants.forEach((res) => {
            sampleDishes.forEach((dish) => {
                finalDishes.push({
                    ...dish,
                    // Yeh important hai: check kijiye aapke foodModel mein 
                    // restaurantId field hai ya nahi.
                    restaurantId: res._id 
                });
            });
        });

        await foodModel.insertMany(finalDishes);
        console.log(`✅ Success: Total ${finalDishes.length} dishes add ho gayi hain ${allRestaurants.length} restaurants ke liye!`);
        
        mongoose.connection.close();
    } catch (error) {
        console.error("Error during seeding:", error);
        process.exit(1);
    }
};

seedData();