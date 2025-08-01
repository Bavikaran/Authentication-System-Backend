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