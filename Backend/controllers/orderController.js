const Order = require('../models/Order');
const Bag = require('../models/Bag');
const User = require('../models/User'); 
const Notification = require('../models/Notification');
const { enqueueRealTimeNotification } = require('../services/queueService'); 

const generateRandomTracking = () => {
    const carriers = ["Delhivery", "Bluedart", "Ecom Express", "XpressBees"];
    const statusOptions = ["Shipped", "Out for Delivery", "Delivered", "In Transit"];
    const locations = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Pune"];
    
    return {
        number: "TRK" + Math.floor(Math.random() * 10000000),
        carrier: carriers[Math.floor(Math.random() * carriers.length)],
        estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        currentLocation: locations[Math.floor(Math.random() * locations.length)],
        status: statusOptions[Math.floor(Math.random() * statusOptions.length)],
        timeline: [{ status: "Order placed", location: "Warehouse", timestamp: new Date().toISOString() }],
    };
};

exports.createOrder = async (req, res) => {
    try {
        const userid = req.params.userId;
        
        const bag = await Bag.find({ userId: userid }).populate("productId");
        if (bag.length === 0) return res.status(400).json({ message: "Bag is empty" });

        const orderItems = bag.map((item) => ({
            productId: item.productId._id,
            size: item.size,
            price: item.productId.price,
            quantity: item.quantity,
        }));

        const total = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        const newOrder = new Order({
            userId: userid,
            date: new Date().toISOString(),
            status: "Processing",
            items: orderItems,
            total: total,
            shippingAddress: req.body.shippingAddress,
            paymentMethod: req.body.paymentMethod,
            tracking: generateRandomTracking(),
        });

        await newOrder.save();
        
        // Handle Notifications
        try {
            // Extract product details
            const firstItem = bag[0];
            const product = firstItem.productId;
            const productName = product?.name || "your item";
            const productImage = (product?.images && product.images.length > 0) 
                ? product.images[0] 
                : (product?.image || ""); 

            // Create dynamic message
            let notificationBody = `Your order for ${productName} (Qty: ${firstItem.quantity})`;
            if (bag.length > 1) {
                notificationBody += ` and ${bag.length - 1} other item(s)`;
            }
            notificationBody += ` has been placed successfully!`;

            // Save to DB
            await Notification.create({
                userId: userid,
                title: "Order Confirmed! 🎉",
                body: notificationBody,
                data: { url: "/orders", image: productImage }
            });
            
            // Send Push Notification
            const user = await User.findById(userid);
            if (user && user.pushToken) {
                await enqueueRealTimeNotification(
                    user.pushToken,
                    "Order Confirmed! 🎉",
                    notificationBody,
                    { url: "/orders", image: productImage }
                );
            }
        } catch (notificationError) {
            // Ignore notification error to not break the order placement
        }
        
        // Clear the user's bag
        await Bag.deleteMany({ userId: userid });

        res.status(200).json({ message: "Order placed successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error placing order" });
    }
};

exports.getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.params.userid }).populate("items.productId");
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: "Error fetching orders" });
    }
};