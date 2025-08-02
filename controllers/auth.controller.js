import { User } from '../models/user.model.js';
import crypto from "crypto";
import bcryptjs from 'bcryptjs';
import { generateTokenAndSetCookie } from '../utils/generateTokenAndSetCookie.js';
import logger from '../utils/logger.js';
import {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendResetSuccessEmail
} from '../utils/emails.js';
import {validationResult} from 'express-validator';
import CustomError from '../utils/customError.js';




export const signup = async (req, res, next) => {
  const errors = validationResult(req); // Check for validation errors
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() }); // Return validation errors
  }

  const { email, password, name, userType } = req.body;

  try {
    // Check if required fields are provided
    if (!email || !password || !name || !userType) {
      throw new CustomError(400, "All fields are required");
    }

    // Check if user already exists
    const userAlreadyExists = await User.findOne({ email });
    if (userAlreadyExists) {
      return next(new CustomError(400, "User already exists with this email"));
      logger.warn(`Signup attempt with existing email: ${email}`);
    }
  

    // Hash the password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Generate a verification token
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

    const user = new User({
      email,
      password: hashedPassword,
      name,
      userType,
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours validity
    });

    // Save the user to the database
    await user.save();

    // Generate JWT and set the cookie
    generateTokenAndSetCookie(res, user._id);

    // Send verification email
    await sendVerificationEmail(user.email, verificationToken);

    // Send success response
    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        ...user._doc,
        password: undefined, // Hide password in the response
      },
    });

    logger.info(`User signed up successfully: ${email}`);

  } catch (error) {
    next(error); // Pass error to the next middleware
    logger.error(`Error during signup for email: ${email}, Error: ${error.message}`);
  }
};



export const verifyEmail = async (req, res) => {
  const { code, resend } = req.body;

  try {
    // Find user based on code or email (if not verified)
    const user = await User.findOne({
      $or: [
        { verificationToken: code, verificationTokenExpiresAt: { $gt: Date.now() } }, // Check if token is valid
        { email: req.body.email, isVerified: false } // Check if the email is unverified
      ],
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired verification code" });
    }

    // If user is already verified and not asking for resend
    if (user.isVerified && !resend) {
      return res.status(400).json({
        success: false,
        message: "Account is already verified. No need to resend the verification link.",
      });
    }

    // If the code is correct and the user is not already verified, set 'isVerified' to true
    user.isVerified = true; // Mark the account as verified
    user.verificationToken = undefined; // Clear the verification token
    user.verificationTokenExpiresAt = undefined; // Clear the expiration time
    await user.save(); // Save the updated user

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });

  } catch (error) {
    console.log("Error in verifyEmail", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const login = async (req, res,next) => {

  const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return next(new CustomError(400, "Invalid credentials" ));
    }

    logger.info(`User logged in: ${user.email}`);

    generateTokenAndSetCookie(res, user._id);
    user.lastLogin = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });

  } catch (error) {
    console.log("Error in login", error);
    next(error);
    logger.error(`Login attempt failed for email: ${email}, Error: ${error.message}`);
  }
  
};




export const logout = async (req, res) => {

  try{
    res.clearCookie("token");
    res.status(200).json({ success: true, message: "Logged out successfully" });
    
  }
  catch (error) {
    console.log("Error in logout", error);
    next(error);
  }

};





export const forgotPassword = async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ success: false, message: "User not found with this email" });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000;

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = resetTokenExpiresAt;
    await user.save();

    // Use process.env.CLIENT_URL to dynamically generate the reset URL
    const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    await sendPasswordResetEmail(user.email, resetURL);

    res.status(200).json({ success: true, message: "Password reset link sent to your email" });

  } catch (error) {
    console.log("Error in forgotPassword", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


export const resetPassword = async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  // Ensure the token is valid and not expired
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpiresAt: { $gt: Date.now() },
  });

    if (!user) {
      return next(new CustomError(400, "Invalid or expired reset token" ));
      logger.warn(`Password reset failed for email: ${user.email}`);
    }

  // Hash the new password
  const hashedPassword = await bcryptjs.hash(password, 10);
  user.password = hashedPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpiresAt = undefined;
  await user.save();

  await sendResetSuccessEmail(user.email);

  res.status(200).json({ success: true, message: "Password reset successful" });
};




export const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      next(new CustomError(400, "User not found"));
    }

    res.status(200).json({ success: true, user });

  } catch (error) {
    console.log("Error in checkAuth", error);
    next(error);
  }
};





