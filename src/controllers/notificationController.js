const { sendNotification } = require('../utils/notificationService');
const User = require('../models/userModel');
const Message = require('../models/messageModel');

const sendCustomNotification = async (req, res) => {
  try {
    const { userId, message } = req.body;

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    const userToken = user.deviceToken;
    if (!userToken) {
      return res.status(400).send({ message: 'User does not have a registered device token' });
    }

    // Send notification and save message
    await sendNotification(userId, userToken, message);

    res.status(200).send({ message: 'Notification sent successfully' });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Function to get notifications for a user or all notifications for an admin
const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const isAdmin = req.user.role === 'admin';
    let messages;

    if (isAdmin) {
      messages = await Message.find().sort({ createdAt: -1 });
    } else {
      messages = await Message.find({ userId }).sort({ createdAt: -1 });
    }

    res.status(200).send({
      result: messages.length,
      data: messages
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Function to delete a notification by its ID
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Message.findByIdAndDelete(id);

    if (!result) {
      return res.status(404).send({ message: 'Notification not found' });
    }

    res.status(200).send({ message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

module.exports = { sendCustomNotification, getNotifications, deleteNotification };
