import orderModel from './../models/orderModel.js';
import userModel from './../models/userModel.js';
import Razorpay from 'razorpay';

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

const placeOrder = async (req, res) => {
    try {
        const newOrder = new orderModel({
            userId: req.body.userId,
            items: req.body.items,
            amount: req.body.amount,
            address: req.body.address,
            payment: false 
        })
        await newOrder.save();
        
        await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

        const options = {
            amount: Number(req.body.amount) * 100, 
            currency: "INR",
            receipt: `receipt_order_${newOrder._id}`,
        };

        const razorpayOrder = await razorpayInstance.orders.create(options);

        if (!razorpayOrder) {
            return res.json({ success: false, message: "Razorpay order creation failed" });
        }

        res.json({ 
            success: true, 
            razorpayOrder: razorpayOrder, 
            localOrderId: newOrder._id 
        });

    } catch (error) {
        console.log("Razorpay order backend error:", error)
        res.json({ success: false, message: "Error setting up Razorpay session" })
    }
}

const verifyOrder = async (req, res) => {
    const { orderId, success } = req.body;
    try {
        if (success === 'true' || success === true) {
            await orderModel.findByIdAndUpdate(orderId, { payment: true });
            res.json({ success: true, message: "Paid Successfully" })
        } else {

            await orderModel.findByIdAndDelete(orderId);
            res.json({ success: false, message: "Payment Declined" })
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: "Error verifying payment integrity" })
    }
}

const userOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({ userId: req.body.userId })
        res.json({ success: true, data: orders })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: "Error fetching user orders" })
    }
}

const listOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({});
        res.json({ success: true, data: orders })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: "Error listing admin system orders" })
    }
}

const updateStatus = async (req, res) => {
    try {
        await orderModel.findByIdAndUpdate(req.body.orderId, { status: req.body.status })
        res.json({ success: true, message: "Status Updated Successfully" })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: "Error updating delivery status" })
    }
}

const verifyDeliveryProof = async (req, res) => {
    const { orderId, verificationMethod } = req.body;
    try {
        if (!orderId) {
            return res.json({ success: false, message: "Order ID Required" });
        }

        await orderModel.findByIdAndUpdate(orderId, { 
            status: "Delivered",
            payment: true 
        });

        res.json({ 
            success: true, 
            message: `Order marked Delivered safely via ${verificationMethod}!` 
        });

    } catch (error) {
        console.log("Delivery Proof Error:", error);
        res.json({ success: false, message: "Failed to process delivery security proof" });
    }
}

export { placeOrder, verifyOrder, userOrders, listOrders, updateStatus, verifyDeliveryProof }