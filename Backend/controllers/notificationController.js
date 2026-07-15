const Notification = require("../models/Notification");

exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id || req.user.userId;
    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID missing from token" });
    }

    const notifications = await Notification.find({ userId: userId }).sort({
      createdAt: -1,
    });

    res.status(200).json({ success: true, notifications });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true },
    );

    if (!notification) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    }

    res
      .status(200)
      .json({
        success: true,
        message: "Notification marked as read",
        notification,
      });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error updating notification" });
  }
};
