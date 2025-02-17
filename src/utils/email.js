const nodemailer = require('nodemailer');
require('dotenv').config();
const pug = require('pug');
const path = require('path');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD
  }
});

async function sendEmail(options) {
  // Determine which template to use
  const templateName = options.template || 'signup-email';
  const templatePath = path.join(__dirname, 'views', 'emails', `${templateName}.pug`);

  // Render the email HTML
  const html = pug.renderFile(templatePath, {
    name: options.name,
    otp: options.otp,
    ...options.data
  });

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: options.email,
      subject: options.subject,
      text: options.message, // Keep plain text version as fallback
      html: html // Add HTML version
    });
  } catch (error) {
    throw new Error('Error sending email');
  }
}

module.exports = sendEmail;
