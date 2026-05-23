import mongoose from 'mongoose';
import 'dotenv/config';
import { connectDB } from './config/db.js';
import restaurantModel from './models/restaurantModel.js';
import foodModel from './models/foodModel.js';

const main = async () => {
  await connectDB();
  const restaurants = await restaurantModel.find({}).lean();
  const foods = await foodModel.find({}).lean();
  console.log(JSON.stringify({ restaurants, foods }, null, 2));
  await mongoose.disconnect();
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
