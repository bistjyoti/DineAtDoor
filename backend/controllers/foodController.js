import fs from 'fs'
import foodModel from '../models/foodModel.js'

// 🎯 1. Add Food Item (With Restaurant Connection)
const addFood = async (req, res) => {

    // Multer se aayi hui image filename
    let image_filename = `${req.file.filename}`;

    const food = new foodModel({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        category: req.body.category,
        image: image_filename,
        // ✨ NEW: Restaurant ID connect karna zaroori hai
        restaurantId: req.body.restaurantId 
    })

    try {
        await food.save();
        res.json({ success: true, message: 'Food Added Successfully!' })
    } catch (error) {
        console.log("❌ Add Food Error:", error)
        res.json({ success: false, message: 'Error adding food' })
    }
}

// 🎯 2. List All Food (Universal List)
const listFood = async (req, res) => {
    try {
        const foods = await foodModel.find({});
        res.json({ success: true, data: foods })
    } catch (error) {
        console.log("❌ List Food Error:", error)
        res.json({ success: false, message: 'Error fetching list' })
    }
}

// 🎯 3. Remove Food Item (With Image Cleanup)
const removeFood = async (req, res) => {
    try {
        // Pehle product dhoondo taaki image file delete kar sakein
        const food = await foodModel.findById(req.body.id);
        
        // Folder se physical file delete karna
        if (food) {
            fs.unlink(`uploads/${food.image}`, (err) => {
                if (err) console.log("Image delete nahi ho payi:", err);
            })
        }

        await foodModel.findByIdAndDelete(req.body.id);
        res.json({ success: true, message: 'Food Removed' })
    } catch (error) {
        console.log("❌ Remove Food Error:", error)
        res.json({ success: false, message: 'Error removing food' })
    }
}

// 🎯 4. Get Menu by Restaurant (Zomato Flow ke liye sabse important)
const getRestaurantMenu = async (req, res) => {
    try {
        const { restaurantId } = req.query; // Frontend se ?restaurantId=... aayega
        const dishes = await foodModel.find({ restaurantId: restaurantId });
        res.json({ success: true, data: dishes });
    } catch (error) {
        console.log("❌ Menu Fetch Error:", error);
        res.json({ success: false, message: "Menu load nahi ho paya" });
    }
}

export { addFood, listFood, removeFood, getRestaurantMenu }