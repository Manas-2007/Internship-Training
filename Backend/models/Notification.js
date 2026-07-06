const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    isRead: {
        type: Boolean,
        default: false // All new notifications start as unread
    },
    data: {
        type: Object, // Optional: to store deep links (e.g., { url: "/bag" })
        default: {}
    }
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

module.exports = mongoose.model('Notification', notificationSchema);