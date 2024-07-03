const admin = require('../config/firebase');
const Message = require('../models/messageModel');

const sendNotification = async (userId, token, message) => {
  const payload = {
    notification: {
      title: message.title,
      body: message.body,
    },
    data: message.data || {},
  };

  let status = 'sent';

  try {
    const response = await admin.messaging().sendToDevice(token, payload);
    console.log('Notification sent successfully:', response);
  } catch (error) {
    console.error('Error sending notification:', error);
    status = 'failed';
  }

  // Save the message in the database
  const newMessage = new Message({
    userId,
    title: message.title,
    body: message.body,
    data: message.data,
    status
  });

  await newMessage.save();
};

module.exports = { sendNotification };
