const { sendNotification } = require('../utils/notificationService');
const User = require('../models/userModel');

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

    // Send notification
    await sendNotification(userToken, message);

    res.status(200).send({ message: 'Notification sent successfully' });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

module.exports = { sendCustomNotification };
