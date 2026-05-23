import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI;

        if (!uri) {
            throw new Error("MONGO_URI not found in environment variables");
        }

        console.log("🔍 Trying to connect to DB...");
        console.log("URI:", uri.replace(/:[^:]*@/, ":****@")); 

        await mongoose.connect(uri, {
            dbName: "DineAtDoor", 
            serverSelectionTimeoutMS: 10000, 
            socketTimeoutMS: 45000,
            retryWrites: true,
            w: "majority"
        });

        console.log("DB Connected Successfully ✅");

    } catch (err) {
        console.log("DB Connection Error");
        console.error("Error Details:", err.message);
        
        if (err.message.includes("ECONNREFUSED")) {
            console.log("\n Possible fixes:");
            console.log("1. Check if MongoDB Atlas cluster is PAUSED - Resume it");
            console.log("2. Whitelist your IP in MongoDB Atlas Network Access");
            console.log("3. Check your internet connection");
        }
        
        throw err;
    }
};

mongoose.connection.on("connected", () => {
    console.log("Mongoose connected");
});

mongoose.connection.on("error", (err) => {
    console.log("Mongoose error:", err);
});

mongoose.connection.on("disconnected", () => {
    console.log("Mongoose disconnected ");
});