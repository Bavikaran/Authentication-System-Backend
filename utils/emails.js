import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import {
  PASSWORD_RESET_REQUEST_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
} from './emailTemplates.js';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // App password, NOT Gmail login
  },
});

const sender = "INTE21323 Auth App" <${process.env.EMAIL_USER}>;


export const sendVerificationEmail = async (email, verificationToken) => {
  const html = VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken);
  try {
    const response = await transporter.sendMail({
      from: sender,
      to: email,
      subject: "Verify your email",
      html,
    });
    console.log("Verification email sent:", response.messageId);
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error("Verification email failed");
  }
};