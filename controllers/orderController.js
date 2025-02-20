import orderModel from "../models/orderModel.js";
import userModel from '../models/userModel.js'
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const placeOrder = async (req, res) => {
    // const frontend_url = "http://localhost:5173/";
    const frontend_url = "https://bulbulart.netlify.app";

    try {
        const newOrder = new orderModel({
            userId: req.body.userId,
            items: req.body.items,
            amount: req.body.amount,
            address: req.body.address
        });
        await newOrder.save();
        await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

        // ✅ Corrected INR Calculation: Amount in paise (₹1 = 100 paise)
        const line_items = req.body.items.map((item) => ({
            price_data: {
                currency: "inr",  // Set currency to INR
                product_data: {
                    name: item.name
                },
                unit_amount: item.price * 100  // Stripe expects paise (₹100 = 10000)
            },
            quantity: item.quantity
        }));

        line_items.push({
            price_data: {
                currency: "inr",
                product_data: {
                    name: "Delivery Charges"
                },
                unit_amount: 2000  // ₹20.00 in paise
            },
            quantity: 1
        });

        const session = await stripe.checkout.sessions.create({
            line_items: line_items,
            mode: 'payment',
            // success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
            success_url: `${frontend_url}`,
            // cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`
            cancel_url: `${frontend_url}`
        });

        res.json({ success: true, session_url: session.url });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};

const notAcceptOrder = async (req, res) => {
    try {
        const { orderId } = req.body;

        if (!orderId) {
            return res.status(400).json({ success: false, message: "Missing orderId" });
        }

        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        await orderModel.findByIdAndUpdate(orderId, { status: "Not Accepted" });
        res.json({ success: true, message: "Order marked as Not Accepted" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

const acceptOrder = async (req, res) => {
    try {
        console.log("🔹 Accept Order API Called");  // Debugging log
        console.log("🔹 Received request body:", req.body);

        const { orderId } = req.body;

        if (!orderId) {
            console.log("❌ Missing orderId in request");
            return res.status(400).json({ success: false, message: "Missing orderId" });
        }

        const order = await orderModel.findById(orderId);
        if (!order) {
            console.log("❌ Order not found:", orderId);
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        await orderModel.findByIdAndUpdate(orderId, { status: "Accepted" });

        console.log("✅ Order marked as Accepted:", orderId);
        res.json({ success: true, message: "Order marked as Accepted" });

    } catch (error) {
        console.error("❌ Server Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

const verifyOrder = async (req,res) => {
    const {orderId,success} = req.body;
    try {
        if (success=="true") {
            await orderModel.findByIdAndUpdate(orderId,{payment:true});
            res.json({success:true,message:"Paid"})
        }
        else{
            await orderModel.findByIdAndDelete(orderId);
            res.json({success:false,message:"Not Paid"})
        }
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
        
    }
}

// user orders for frontend
const userOrders = async (req,res) => {
    try {
        const orders = await orderModel.find({userId:req.body.userId})
        res.json({success:true,data:orders})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
        
    }
}

// Listing orders for admin panel
const listOrders = async(req,res) => {
    try {
        const orders = await orderModel.find({});
        res.json({success:true,data:orders})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
        
    }
}

export {placeOrder,verifyOrder,userOrders,listOrders,notAcceptOrder, acceptOrder}
