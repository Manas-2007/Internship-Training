const Order = require('../models/Order');
const Bag = require('../models/Bag');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Transaction = require('../models/Transaction');
const TransactionAudit = require('../models/TransactionAudit');
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
        const userId = req.params.userId;   

        const bag = await Bag.find({ userId, status: 'active' }).populate("productId")
        if (!bag || bag.length === 0) {
            return res.status(400).json({ message: "Bag is empty" });
        }

        const orderItems = bag.map((item) => ({
            productId: item.productId._id,
            size: item.size,
            price: item.productId.price,
            quantity: item.quantity,
        }));

        const total = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        const newOrder = new Order({
            userId,
            date: new Date().toISOString(),
            status: "Processing",
            items: orderItems,
            total,
            shippingAddress: req.body.shippingAddress,
            paymentMethod: req.body.paymentMethod,
            tracking: generateRandomTracking(),
        });

        await newOrder.save();

        try {
            const newTxnId = `TXN_ORD_${newOrder._id.toString().slice(-8).toUpperCase()}`;

            await Transaction.create({
                userId,
                orderId: newOrder._id,
                providerTransactionId: newTxnId,
                amount: total,
                paymentMode: req.body.paymentMethod || "COD",
                status: "Pending"
            });

            await TransactionAudit.create({
                transactionId: newTxnId,
                action: 'Creation',
                status: 'Pending',
                payload: {
                    orderId: newOrder._id,
                    amount: total,
                    method: req.body.paymentMethod
                }
            });
        } catch (txnError) {
            console.error("Transaction linkage failed:", txnError);
        }

        try {
            const firstItem = bag[0];
            const product = firstItem.productId;
            const productName = product?.name || "your item";
            const productImage = (product?.images && product.images.length > 0)
                ? product.images[0]
                : (product?.image || "");

            let notificationBody = `Your order for ${productName} (Qty: ${firstItem.quantity})`;
            if (bag.length > 1) {
                notificationBody += ` and ${bag.length - 1} other item(s)`;
            }
            notificationBody += ` has been placed successfully!`;

            await Notification.create({
                userId,
                title: "Order Confirmed! 🎉",
                body: notificationBody,
                data: { url: "/orders", image: productImage }
            });

            const user = await User.findById(userId);
            if (user && user.pushToken) {
                await enqueueRealTimeNotification(
                    user.pushToken,
                    "Order Confirmed! 🎉",
                    notificationBody,
                    { url: "/orders", image: productImage }
                );
            }
        } catch (notificationError) {
            console.error("Notification failed:", notificationError);           
        }

        await Bag.deleteMany({ userId, status: 'active' });

        res.status(200).json({ message: "Order placed successfully" });
    } catch (error) {
        console.error("Order creation error:", error);
        res.status(500).json({ message: "Error placing order" });
    }
};

exports.getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.params.userid }).populate("items.productId");
        res.status(200).json(orders);
    } catch (error) {
        console.error("Fetch orders error:", error);
        res.status(500).json({ message: "Error fetching orders" });
    }
};