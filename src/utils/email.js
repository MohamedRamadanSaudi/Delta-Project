const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD
  }
});

async function sendEmail(options) {
  try {
    let info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: options.email,
      subject: options.subject,
      text: options.message,
    });
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Error sending email');
  }
}

module.exports = sendEmail;
