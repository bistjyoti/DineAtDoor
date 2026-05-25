import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    rating: { type: Number, default: 0 },
    location: { type: String, required: true },
    cuisine: { type: Array, required: true }, 
    isClosed: { type: Boolean, default: false },
    swiggyId: { type: String, required: true }, 
    lat: { type: Number }, 
    lng: { type: Number } 
});

const restaurantModel = mongoose.models.restaurant || mongoose.model("restaurant", restaurantSchema);
export default restaurantModel;