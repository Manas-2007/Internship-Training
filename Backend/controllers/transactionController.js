const Transaction = require('../models/Transaction');

exports.getTransactions = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id || req.user.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const sortBy = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

        let query = { userId: userId };
        if (req.query.status && req.query.status !== 'All') {
            query.status = req.query.status;
        }
        if (req.query.paymentMode && req.query.paymentMode !== 'All') {
            query.paymentMode = req.query.paymentMode;
        }

        const transactions = await Transaction.find(query)
            .sort({ [sortBy]: sortOrder })
            .skip(skip)
            .limit(limit)
           .populate({
                path: 'orderId',
                populate: {
                    path: 'items.productId',
                    select: 'name images image' 
                }
            }); 

        const totalTransactions = await Transaction.countDocuments(query);
        const totalPages = Math.ceil(totalTransactions / limit);

        res.status(200).json({
            success: true,
            data: transactions,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalTransactions: totalTransactions,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });

    } catch (error) {
        console.error("Get Transactions Error:", error);
        res.status(500).json({ success: false, message: 'Server Error fetching transactions' });
    }
};

exports.seedMockTransactions = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id || req.user.userId;
        const statuses = ['Success', 'Failed', 'Refunded', 'Pending'];
        const modes = ['UPI', 'Credit Card', 'Debit Card', 'Net Banking'];

        const dummyData = [];
        for (let i = 0; i < 15; i++) {
            dummyData.push({
                userId: userId,
                providerTransactionId: `MOCK_TXN_${Date.now()}_${i}`,
                amount: Math.floor(Math.random() * 5000) + 500,
                paymentMode: modes[Math.floor(Math.random() * modes.length)],
                status: statuses[Math.floor(Math.random() * statuses.length)],
                createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)
            });
        }

        await Transaction.insertMany(dummyData);

        res.status(200).json({ success: true, message: "15 Dummy transactions added successfully!" });
    } catch (error) {
        console.error("Seed Error:", error);
        res.status(500).json({ success: false, message: "Error adding dummy data" });
    }
};