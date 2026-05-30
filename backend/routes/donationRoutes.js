import express from 'express';
const router = express.Router();
import NGODonation from '../models/NGODonation.js';

// 1. Restaurant se Donation Post karna
router.post('/donate', async (req, res) => {
  try {
    const { foodItems, quantity, expiryTime, restaurantId } = req.body;
    const newDonation = new NGODonation({
      restaurantId,
      foodItems,
      quantity,
      expiryTime,
      status: 'Available'
    });
    await newDonation.save();
    res.status(201).json({ message: "Khana donate ho gaya! ✅" });
  } catch (error) {
    res.status(500).json({ error: "Donation fail ho gaya!" });
  }
});

// 2. NGO ke liye Available Khana dikhana
router.get('/available', async (req, res) => {
  try {
    const availableFood = await NGODonation.find({ status: 'Available' })
      .populate('restaurantId', 'name address');
    res.status(200).json(availableFood);
  } catch (error) {
    res.status(500).json({ error: "Data fetch nahi ho raha." });
  }
});

// 3. NGO ka Claim Button
router.patch('/claim/:id', async (req, res) => {
  try {
    const { ngoId } = req.body;
    const donation = await NGODonation.findByIdAndUpdate(
      req.params.id,
      { status: 'Claimed', ngoId: ngoId },
      { new: true }
    );
    res.status(200).json({ message: "Food claimed successfully!", donation });
  } catch (error) {
    res.status(500).json({ error: "Claim fail ho gaya." });
  }
});

// YEH SABSE ZAROORI HAI - Iske bina crash ho raha hai!
export default router;