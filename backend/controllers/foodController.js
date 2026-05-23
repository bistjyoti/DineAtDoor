import fs from 'fs'
import foodModel from '../models/foodModel.js'

const addFood = async (req, res) => {
    try {
        let image_filename = `${req.file.filename}`;

        const food = new foodModel({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            category: req.body.category,
            image: image_filename,
            restaurantId: req.body.restaurantId 
        })

        await food.save();
        res.json({ success: true, message: 'Food Added Successfully!' })
    } catch (error) {
        console.log("Add Food Error:", error)
        res.json({ success: false, message: 'Error adding food' })
    }
}


const listFood = async (req, res) => {
    try {
        const foods = await foodModel.find({});
        res.json({ success: true, data: foods })
    } catch (error) {
        console.log("List Food Error:", error)
        res.json({ success: false, message: 'Error fetching list' })
    }
}


const removeFood = async (req, res) => {
    try {
        const food = await foodModel.findById(req.body.id);
        
        if (food && !food.image.startsWith('http')) {
            fs.unlink(`uploads/${food.image}`, (err) => {
                if (err) console.log("Image file not found locally, skipping delete.");
            })
        }

        await foodModel.findByIdAndDelete(req.body.id);
        res.json({ success: true, message: 'Food Removed' })
    } catch (error) {
        console.log("Remove Food Error:", error)
        res.json({ success: false, message: 'Error removing food' })
    }
}


const getRestaurantMenu = async (req, res) => {
    try {
        const { restaurantId, id } = req.query;
        const finalId = restaurantId || id;

        if (!finalId) {
            return res.json({ success: false, message: "Restaurant ID provide karein query mein" });
        }

        console.log("Fetching menu for ID:", finalId);
        const dishes = await foodModel.find({ restaurantId: finalId });
        console.log(`Result: ${dishes.length} dishes found.`);

        res.json({ 
            success: true, 
            data: dishes 
        });
    } catch (error) {
        console.log("Menu Fetch Error:", error);
        res.json({ success: false, message: "Menu load nahi ho paya" });
    }
}

export { addFood, listFood, removeFood, getRestaurantMenu }