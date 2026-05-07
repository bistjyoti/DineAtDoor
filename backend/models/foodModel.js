import mongoose from "mongoose";

const foodSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String, 
        required: true 
    },
    price: { 
        type: Number, 
        required: true 
    },
    image: { 
        type: String, 
        required: true 
    },
    category: { 
        type: String, 
        required: true 
    },
    restaurantId: { 
        type: String, 
        required: true 
    }
}, { timestamps: true }); 

// Models check karke export kar rahe hain
const foodModel = mongoose.models.food || mongoose.model("food", foodSchema);

export default foodModel;