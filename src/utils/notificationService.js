const admin = require('../config/firebase');

const sendNotification = async (token, message) => {
  const payload = {
    notification: {
      title: message.title,
      body: message.body,
    },
    data: message.data || {}
  };

  try {
    await admin.messaging().send(token, payload);
    console.log('Notification sent successfully');
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

module.exports = { sendNotification };