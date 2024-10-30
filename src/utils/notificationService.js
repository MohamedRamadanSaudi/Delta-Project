const admin = require('../config/firebase');
const Message = require('../models/messageModel');

const sendNotification = async (userId, token, message) => {
  const payload = {
    token,
    notification: {
      title: message.title,
      body: message.body,
    },
    data: message.data || {},
  };

  let status = 'sent';

  try {
    await admin.messaging().send(payload);
  } catch (error) {
    console.log('Error sending message:', error);
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
