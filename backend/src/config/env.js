const dotenv = require('dotenv');
dotenv.config();

const required = [
  'MONGODB_URI',
  'JWT_SECRET',
  'BREVO_SMTP_HOST',
  'BREVO_SMTP_PORT',
  'BREVO_SMTP_USER',
  'BREVO_SMTP_PASS',
  'FROM_EMAIL',
  'FROM_NAME',
];

const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(`Missing required env vars: ${missing.join(', ')}`);
  process.exit(1);
}

module.exports = {
  port: process.env.PORT || 5000,
  mongodbUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  brevoSmtpHost: process.env.BREVO_SMTP_HOST,
  brevoSmtpPort: parseInt(process.env.BREVO_SMTP_PORT) || 587,
  brevoSmtpUser: process.env.BREVO_SMTP_USER,
  brevoSmtpPass: process.env.BREVO_SMTP_PASS,
  fromEmail: process.env.FROM_EMAIL,
  fromName: process.env.FROM_NAME,
  openrouterApiKey: process.env.OPENROUTER_API_KEY,
  openrouterModel: process.env.OPENROUTER_MODEL || 'openai/gpt-oss-120b',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  uploadPath: process.env.UPLOAD_PATH || './uploads',
};
