import mongoose from "mongoose";

export const connectDB = async () => {
await mongoose.connect('mongodb+srv://bistjyoti64:November911@cluster0.pfylcfh.mongodb.net/food-del')
.then(() => console.log("DB Connected"))
.catch((err) => console.log("DB Error:", err));
}