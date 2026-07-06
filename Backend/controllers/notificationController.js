const Notification = require('../models/Notification');

exports.getUserNotifications = async (req, res) => {
    try {
        console.log("--- FRONTEND NE API CALL KI ---");
        
        // 1. Dekhte hain middleware ne user data kya bheja hai
        console.log("Token Data:", req.user); 

        // 2. User ID nikalne ka sabse safe tarika
        const userId = req.user.id || req.user._id || req.user.userId;

        if (!userId) {
            console.log("❌ ERROR: Token me User ID nahi mili!");
            return res.status(400).json({ success: false, message: "User ID missing from token" });
        }

        console.log("✅ Searching DB for User ID:", userId);

        // 3. Database se fetch karna
        const notifications = await Notification.find({ userId: userId }).sort({ createdAt: -1 });

        console.log(`✅ Success! Found ${notifications.length} notifications.`);

        res.status(200).json({ success: true, notifications });
        
    } catch (error) {
        console.error("❌ BACKEND CRASH HO GAYA:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// ... apna markAsRead function yahan niche waise hi rehne dein ...

exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await Notification.findByIdAndUpdate(
            id, 
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        res.status(200).json({ success: true, message: 'Notification marked as read', notification });
    } catch (error) {
        console.error("Error marking notification as read:", error);
        res.status(500).json({ success: false, message: 'Server Error updating notification' });
    }
};