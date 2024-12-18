import { transporter } from "./config";
import {
  verificationTokenEmailTemplate,
  WELCOME_EMAIL_TEMPLATE,
} from "./email-templates";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

// Centralized function to send emails
const sendEmail = async ({ to, subject, html }: EmailOptions): Promise<void> => {
  try {
    const from = process.env.MAIL_FROM_ADDRESS!;
    await transporter.sendMail({ from, to, subject, html });
    console.log(`Email sent successfully to ${to} with subject: "${subject}".`);
  } catch (error: any) {
    console.error(`Error sending email to ${to}:`, error.message, error.stack);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

// Send verification email
export const sendVerificationEmail = async (
  email: string,
  verificationToken: string
): Promise<void> => {
  if (!verificationTokenEmailTemplate) {
    throw new Error("Verification email template is missing.");
  }

  const html = verificationTokenEmailTemplate.replace(
    "{verificationToken}",
    verificationToken
  );

  await sendEmail({
    to: email,
    subject: "Verify Your Email Address Now",
    html,
  });
};

// Send welcome email
export const sendWelcomeEmail = async (
  email: string,
  username: string
): Promise<void> => {
  if (!WELCOME_EMAIL_TEMPLATE) {
    throw new Error("Welcome email template is missing.");
  }

  const html = WELCOME_EMAIL_TEMPLATE.replace("{name}", username);

  await sendEmail({
    to: email,
    subject: "Welcome to our company",
    html,
  });
};

// Send password reset email
export const sendPasswordResetEmail = async (
  email: string,
  resetURL: string
): Promise<void> => {
  const html = `Click <a href="${resetURL}">here</a> to reset your password.`;

  await sendEmail({
    to: email,
    subject: "Reset Your Password",
    html,
  });
};

// Send password reset success email
export const sendResetSuccessEmail = async (email: string): Promise<void> => {
  const html = "Your password has been successfully reset.";

  await sendEmail({
    to: email,
    subject: "Password Reset Successful",
    html,
  });
};
