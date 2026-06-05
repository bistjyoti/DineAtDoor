import nodemailer from 'nodemailer';

// Email bhejne wala transporter setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'bistjyoti64@gmail.com', // ✅ Ekdum sahi hai tumhari Gmail ID
        pass: 'yowcpjrhucdzcjra'      // ✅ Ekdum sahi hai tera App Password bina spaces ke
    }
});

export const sendClaimEmail = async (restaurantEmail, restaurantName, foodItems, quantity) => {
    try {
        const mailOptions = {
            from: '"DineAtDoor 🍲" <bistjyoti64@gmail.com>', // 🎯 FIXED: Yahan tumhari real Gmail ID daal di hai
            to: restaurantEmail || "bistjyoti64@gmail.com", // 🎯 FIXED: Agar restaurant ka email na mile toh testing ke liye tumhare paas hi mail aayega
            subject: '🎉 Great News!Your Donated Food is Claimed!',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 600px; margin: 0 auto; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                    <div style="text-align: center; border-bottom: 2px solid #2ecc71; padding-bottom: 10px;">
                        <h1 style="color: #2ecc71; margin: 0;">DineAtDoor 🍲</h1>
                    </div>
                    <h2 style="color: #2c3e50; font-size: 20px;">Hello ${restaurantName},</h2>
                    <p style="font-size: 16px; color: #333; line-height: 1.5;">The food you donated to a noble cause has been successfully. <b style="color: #2ecc71;">Claim</b> claimed by an organization!</p>
                    
                    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff4757;">
                        <h4 style="margin-top: 0; color: #ff4757; font-size: 16px;">Donation Details:</h4>
                        <p style="margin: 5px 0;"><b>Items:</b> ${foodItems}</p>
                        <p style="margin: 5px 0;"><b>Quantity:</b> ${quantity}</p>
                    </div>
                    
                    <p style="font-size: 14px; color: #555;">NGO team will reach to your address soon. Please keep the food packets ready.Thank You</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p style="font-size: 12px; color: #999; text-align: center;">Thank you for making a difference and reducing food waste! 💚</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`✉️ Email successfully sent to ${restaurantName}!`);
    } catch (error) {
        console.error("❌ Email Sending Failed:", error);
    }
};