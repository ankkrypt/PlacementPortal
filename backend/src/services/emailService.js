const nodemailer = require('nodemailer');
const config = require('../config/env');

const transporter = nodemailer.createTransport({
  host: config.brevoSmtpHost,
  port: config.brevoSmtpPort,
  auth: {
    user: config.brevoSmtpUser,
    pass: config.brevoSmtpPass,
  },
});

async function sendEmail(to, subject, htmlBody) {
  try {
    await transporter.sendMail({
      from: `"${config.fromName}" <${config.fromEmail}>`,
      to,
      subject,
      html: htmlBody,
    });
    console.log(`Email sent to ${to}: ${subject}`);
  } catch (error) {
    console.error(`Email send error to ${to}: ${error.message}`);
  }
}

module.exports = { sendEmail };
