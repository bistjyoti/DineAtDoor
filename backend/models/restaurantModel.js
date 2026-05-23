import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    rating: { type: Number, default: 0 },
    location: { type: String, required: true }, // Jaise "Civil Lines, Roorkee"
    cuisine: { type: Array, required: true }, // Jaise ["North Indian", "Chinese"]
    isClosed: { type: Boolean, default: false },
    swiggyId: { type: String, required: true }, // Swiggy's restaurant ID for menu fetching
    lat: { type: Number }, // Latitude for menu fetching
    lng: { type: Number } // Longitude for menu fetching
});

const restaurantModel = mongoose.models.restaurant || mongoose.model("restaurant", restaurantSchema);
export default restaurantModel;