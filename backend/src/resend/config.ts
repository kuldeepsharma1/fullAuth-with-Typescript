import nodemailer from "nodemailer";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Ensure required environment variables are set
const {
  MAIL_HOST,
  MAIL_PORT,
  MAIL_USERNAME,
  MAIL_PASSWORD,
  MAIL_FROM_ADDRESS,
} = process.env;

if (!MAIL_HOST || !MAIL_PORT || !MAIL_USERNAME || !MAIL_PASSWORD || !MAIL_FROM_ADDRESS) {
  throw new Error(
    "Mail configuration is incomplete. Please ensure all required environment variables (MAIL_HOST, MAIL_PORT, MAIL_USERNAME, MAIL_PASSWORD, MAIL_FROM_ADDRESS) are set."
  );
}

// Define the transporter with updated typing for options
const transporter = nodemailer.createTransport({
  host: MAIL_HOST,
  port: parseInt(MAIL_PORT, 10),
  auth: {
    user: MAIL_USERNAME,
    pass: MAIL_PASSWORD,
  },
});

// Verify transporter configuration
(async () => {
  try {
    await transporter.verify();
    console.log("Mail transporter is configured and ready.");
  } catch (error) {
    console.error("Error verifying mail transporter:", error);
    throw error;
  }
})();

export { transporter };
