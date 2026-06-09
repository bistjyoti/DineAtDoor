import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS      
    }
});

export const sendClaimEmail = async (restaurantEmail, restaurantName, foodItems, quantity) => {
    try {
        const mailOptions = {
            from: `"DineAtDoor 🍲" <${process.env.EMAIL_USER}>`, 
            to: restaurantEmail || process.env.EMAIL_USER, 
            subject: 'Great News! Your Donated Food Has Been Claimed!',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 600px; margin: 0 auto; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                    <div style="text-align: center; border-bottom: 2px solid #2ecc71; padding-bottom: 10px;">
                        <h1 style="color: #2ecc71; margin: 0;">DineAtDoor 🍲</h1>
                    </div>
                    <h2 style="color: #2c3e50; font-size: 20px;">Hello ${restaurantName},</h2>
                    
                    <p style="font-size: 16px; color: #333; line-height: 1.5;">Great news! The food surplus you generously donated has been successfully <b style="color: #2ecc71;">Claimed</b> by a registered organization.</p>
                    
                    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff4757;">
                        <h4 style="margin-top: 0; color: #ff4757; font-size: 16px;">Donation Details:</h4>
                        <p style="margin: 5px 0;"><b>Items:</b> ${foodItems}</p>
                        <p style="margin: 5px 0;"><b>Quantity:</b> ${quantity}</p>
                    </div>
                    
                    <p style="font-size: 14px; color: #555;">An NGO logistics team will arrive at your registered address shortly to collect the package. Please ensure the food packets are ready for handover.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p style="font-size: 12px; color: #999; text-align: center;">Thank you for your kindness and for helping us reduce food waste! 💚</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`✉️ Email successfully dispatched to restaurant: ${restaurantName} (${restaurantEmail || 'Backup Mail'})`);
    } catch (error) {
        console.error("❌ Nodemailer Email Transmission Failed:", error);
    }
};