const Transaction = require('../models/Transaction');

exports.getTransactions = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id || req.user.userId;

        // 1. Pagination Parameters (Default: Page 1, 10 items per page)
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // 2. Sorting Parameters (Default: Date descending - newest first)
        const sortBy = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

        // 3. Filtering Logic
        let query = { userId: userId };

        // Agar user ne status filter lagaya hai (e.g., ?status=Success)
        if (req.query.status && req.query.status !== 'All') {
            query.status = req.query.status;
        }

        // Agar user ne payment mode filter lagaya hai (e.g., ?paymentMode=UPI)
        if (req.query.paymentMode && req.query.paymentMode !== 'All') {
            query.paymentMode = req.query.paymentMode;
        }

        // 4. Database Query with Pagination
        const transactions = await Transaction.find(query)
            .sort({ [sortBy]: sortOrder })
            .skip(skip)
            .limit(limit)
            .populate('orderId', 'total date'); // Order details bhi le aayenge

        // 5. Total count for frontend pagination UI
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