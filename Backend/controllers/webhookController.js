const Transaction = require('../models/Transaction');
const TransactionAudit = require('../models/TransactionAudit');
const Order = require('../models/Order');

exports.handlePaymentWebhook = async (req, res) => {
    try {
        // 1. Webhook se data nikalna (Example format based on general gateways)
        const payload = req.body;
        
        // Note: Production mein yahan webhook signature validation bhi hota hai (e.g., crypto.verify)
        const eventType = payload.event || 'payment.captured'; 
        const paymentData = payload.payload?.payment?.entity || payload.data || {};

        const providerTransactionId = paymentData.id || `MOCK_TXN_${Date.now()}`;
        const orderId = paymentData.order_id || payload.orderId;
        const amount = paymentData.amount ? (paymentData.amount / 100) : 0; // Paise/Cents to Rupee/Dollar
        const paymentMode = paymentData.method || 'Card/UPI';
        const status = eventType === 'payment.captured' ? 'Success' : 'Failed';

        // 2. 🕵️‍♂️ AUDIT LOG: Sabse pehle incident record karo (Chahe duplicate ho ya naya)
        await TransactionAudit.create({
            transactionId: providerTransactionId,
            action: `WEBHOOK_RECEIVED: ${eventType}`,
            status: status,
            payload: payload
        });

        // 3. 🛡️ IDEMPOTENCY CHECK (The Magic Check)
        const existingTransaction = await Transaction.findOne({ providerTransactionId });

        if (existingTransaction) {
            console.log(`[Webhook] Duplicate webhook received for ${providerTransactionId}. Ignoring.`);
            // Duplicate hai, toh process mat karo, bas OK bhej do taaki Gateway shaant ho jaye
            return res.status(200).json({ success: true, message: 'Duplicate webhook handled idempotently' });
        }

        // 4. Create NEW Transaction (Kyunki ye duplicate nahi hai)
        // User ID gateway ke notes/metadata se aati hai jab order create hota hai
        const userId = paymentData.notes?.userId || req.body.userId; 

        if (status === 'Success' && userId) {
            await Transaction.create({
                userId: userId,
                orderId: orderId,
                providerTransactionId: providerTransactionId,
                amount: amount,
                paymentMode: paymentMode,
                status: 'Success'
            });

            // 5. Order ka status update karna
            if (orderId) {
                await Order.findByIdAndUpdate(orderId, {
                    status: 'Paid',
                    paymentMethod: paymentMode
                });
            }
        }

        // Gateway ko bata do ki sab successfully ho gaya
        res.status(200).json({ success: true, message: 'Webhook processed successfully' });

    } catch (error) {
        console.error("Webhook Error:", error);
        // Error ke time bhi log karna zaroori hai
        await TransactionAudit.create({
            transactionId: 'UNKNOWN',
            action: 'WEBHOOK_CRASH',
            status: 'Error',
            payload: { error: error.message }
        });
        res.status(500).json({ success: false, message: 'Webhook processing failed' });
    }
};