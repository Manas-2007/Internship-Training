const Transaction = require('../models/Transaction');
const TransactionAudit = require('../models/TransactionAudit');
const Order = require('../models/Order');

exports.handlePaymentWebhook = async (req, res) => {
    try {
        const payload = req.body;
        const eventType = payload.event || 'payment.captured'; 
        const paymentData = payload.payload?.payment?.entity || payload.data || {};
        const providerTransactionId = paymentData.id || `MOCK_TXN_${Date.now()}`;
        const orderId = paymentData.order_id || payload.orderId;
        const amount = paymentData.amount ? (paymentData.amount / 100) : 0; 
        const paymentMode = paymentData.method || 'Card/UPI';
        const status = eventType === 'payment.captured' ? 'Success' : 'Failed';
        await TransactionAudit.create({
            transactionId: providerTransactionId,
            action: `WEBHOOK_RECEIVED: ${eventType}`,
            status: status,
            payload: payload
        });

        const existingTransaction = await Transaction.findOne({ providerTransactionId });
        if (existingTransaction) {
            console.warn(`[Webhook] Duplicate webhook received for ${providerTransactionId}. Ignoring.`);
            return res.status(200).json({ success: true, message: 'Duplicate webhook handled idempotently' });
        }

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

            if (orderId) {
                await Order.findByIdAndUpdate(orderId, {
                    status: 'Paid',
                    paymentMethod: paymentMode
                });
            }
        }
        res.status(200).json({ success: true, message: 'Webhook processed successfully' });

    } catch (error) {
        console.error("Webhook Error:", error);
        await TransactionAudit.create({
            transactionId: 'UNKNOWN',
            action: 'WEBHOOK_CRASH',
            status: 'Error',
            payload: { error: error.message }
        });
        res.status(500).json({ success: false, message: 'Webhook processing failed' });
    }
};