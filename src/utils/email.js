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

  console.log('Sending email to:', options.email);
  
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: options.email, // Change this line to use options.email
    subject: options.subject,
    text: options.message,
  });
}

module.exports = sendEmail;
