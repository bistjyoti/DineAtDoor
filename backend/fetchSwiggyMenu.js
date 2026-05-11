import mongoose from "mongoose";
import foodModel from "./models/foodModel.js";
import fs from "fs";

const MONGO_URI = "mongodb://bistjyoti:jyoti1234@ac-lg8wzso-shard-00-00.a9bwasv.mongodb.net:27017,ac-lg8wzso-shard-00-01.a9bwasv.mongodb.net:27017,ac-lg8wzso-shard-00-02.a9bwasv.mongodb.net:27017/DineAtDoor?ssl=true&replicaSet=atlas-9h4vax-shard-0&authSource=admin&appName=DineAtDoor";
const restaurantMongoId = "69fb3af868cf27577bf58e32"; 

const syncMenu = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to DB... 🚀");

        if (!fs.existsSync("./pizzahut.json")) {
            console.log("Error: pizzahut.json file nahi mili!");
            return;
        }

        const rawData = fs.readFileSync("./pizzahut.json", "utf-8");
        const jsonData = JSON.parse(rawData);

        const cards = jsonData?.data?.cards?.find(x => x.groupedCard)?.groupedCard?.cardGroupMap?.REGULAR?.cards;
        
        if (!cards) {
            console.log("Error: JSON structure sahi nahi hai.");
            return;
        }

        let allItems = [];
        cards.forEach(c => {
            const itemCards = c.card?.card?.itemCards;
            if (itemCards && Array.isArray(itemCards)) {
                allItems = [...allItems, ...itemCards];
            }
        });

        console.log("Total dishes found:", allItems.length); 

        const dishes = allItems.map(item => {
            const info = item.card.info;
            const price = (info.price || info.defaultPrice || 0) / 100;
            
            return {
                name: info.name,
                price: price,
                description: info.description || "Fresh and delicious Pizza Hut specialty",
                image: info.imageId ? `https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_300,h_300,c_fit/${info.imageId}` : "default_pizza.png",
                category: "Pizza", 
                restaurantId: new mongoose.Types.ObjectId(restaurantMongoId)
            };
        });

        if (dishes.length > 0) {
            // ✨ FIX: Yahan bhi ObjectId use karo delete karne ke liye
            await foodModel.deleteMany({ restaurantId: new mongoose.Types.ObjectId(restaurantMongoId) });
            await foodModel.insertMany(dishes);
            console.log(`✅ Success: ${dishes.length} Dishes added as ObjectIds!`);
        }

        await mongoose.connection.close();
        console.log("DB Connection Closed");
        
    } catch (error) {
        console.error("Error:", error);
    }
};

syncMenu();