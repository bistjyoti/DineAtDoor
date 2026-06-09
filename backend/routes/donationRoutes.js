import express from 'express';
const router = express.Router();
import NGODonation from '../models/NGODonation.js';
import nodemailer from 'nodemailer'; 

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS      
    }
});

const sendClaimEmail = async (restaurantName, restaurantEmail, foodItems, quantity) => {
    try {
        const mailOptions = {
            from: `"DineAtDoor" <${process.env.EMAIL_USER}>`,
            to: restaurantEmail || process.env.EMAIL_USER, 
            subject: 'Great News! Your Donated Food Has Been Claimed!',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 600px; margin: 0 auto; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                    <div style="text-align: center; border-bottom: 2px solid #2ecc71; padding-bottom: 10px;">
                        <h1 style="color: #2ecc71; margin: 0;">DineAtDoor</h1>
                    </div>
                    <h2 style="color: #2c3e50; font-size: 20px;">Hello ${restaurantName},</h2>
                    <p style="font-size: 16px; color: #333; line-height: 1.5;">Thank you for your generous contribution! We are pleased to inform you that a registered NGO has successfully <b style="color: #2ecc71;">Claimed</b> your donated food surplus.</p>
                    
                    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff4757;">
                        <h4 style="margin-top: 0; color: #ff4757; font-size: 16px;">Donation Details:</h4>
                        <p style="margin: 5px 0;"><b>Items:</b> ${foodItems}</p>
                        <p style="margin: 5px 0;"><b>Quantity:</b> ${quantity}</p>
                    </div>
                    
                    <p style="font-size: 14px; color: #555;">The NGO pickup team will arrive at your address shortly to collect the food. Please ensure the food packets are safely packed and ready for handover.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p style="font-size: 12px; color: #999; text-align: center;">Thank you for making a real difference and helping us reduce food waste! 💚</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`✉️ Professional English Email successfully sent to real restaurant: ${restaurantEmail}`);
    } catch (error) {
        console.error("❌ Nodemailer Real Email Failed:", error);
    }
};

// URL: http://localhost:4000/api/donations/donate
router.post('/donate', async (req, res) => {
    try {
        const { foodItems, quantity, expiryTime, restaurantId, restaurantName, restaurantAddress } = req.body;
        
        const newDonation = new NGODonation({
            restaurantId,
            restaurantName: restaurantName || "DineAtDoor Partner", 
            restaurantAddress: restaurantAddress || "Nearby Location", 
            foodItems,
            quantity,
            expiryTime, 
            status: 'Available'
        });

        await newDonation.save();
        res.status(201).json({ success: true, message: "Food is Donated! ✅" });
    } catch (error) {
        console.error("Donate Error:", error);
        res.status(500).json({ success: false, message: "Donation is failed!", error: error.message });
    }
});

router.get('/list', async (req, res) => {
    try {
        const currentTime = new Date(); 

        const availableFood = await NGODonation.find({ 
            status: 'Available',
            expiryTime: { $gt: currentTime } 
        })
        .populate({
            path: 'restaurantId',
            select: 'name address location email',
            model: 'Restaurant' 
        }); 

        res.status(200).json({ 
            success: true, 
            data: availableFood 
        });
    } catch (error) {
        console.error("Fetch List Error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Data cannot be fetched.", 
            error: error.message 
        });
    }
});

// URL: http://localhost:4000/api/donations/claim/:id
router.patch('/claim/:id', async (req, res) => {
    try {
        const { ngoId } = req.body;
        
        // 1. Status update karo
        const donation = await NGODonation.findByIdAndUpdate(
            req.params.id,
            { status: 'Claimed', ngoId: ngoId },
            { new: true }
        );

        if (!donation) {
            return res.status(404).json({ success: false, message: "Donation nahi mila!" });
        }

        const populatedDonation = await NGODonation.findById(donation._id).populate({
            path: 'restaurantId',
            select: 'email',
            model: 'Restaurant'
        });

        const realRestaurantEmail = populatedDonation.restaurantId?.email;
        const targetName = donation.restaurantName;

        await sendClaimEmail(targetName, realRestaurantEmail, donation.foodItems, donation.quantity);

        res.status(200).json({ 
            success: true, 
            message: "Food claimed successfully! Email sent to restaurant.", 
            donation 
        });
    } catch (error) {
        console.error("Claim Error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Claim failed.", 
            error: error.message 
        });
    }
});

router.get('/history/:ngoId', async (req, res) => {
    try {
        const { ngoId } = req.params;
        
        const myHistory = await NGODonation.find({ 
            status: 'Claimed', 
            ngoId: ngoId 
        }).sort({ updatedAt: -1 }); 

        res.status(200).json({ 
            success: true, 
            data: myHistory 
        });
    } catch (error) {
        console.error("History Fetch Error:", error);
        res.status(500).json({ 
            success: false, 
            message: "History cannot be loaded.", 
            error: error.message 
        });
    }
});

export default router;