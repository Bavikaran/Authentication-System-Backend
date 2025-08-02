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




export const signup = async (req, res) => {

  const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
  const { email, password, name, userType } = req.body;

  try {
    if (!email || !password || !name || !userType) {
      throw new CustomError(400, "All fields are required");
    }

    const userAlreadyExists = await User.findOne({ email });
    if (userAlreadyExists) {
      return next(new CustomError(400, "User already exists with this email"));
      logger.warn(`Signup attempt with existing email: ${email}`);
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

    const user = new User({
      email,
      password: hashedPassword,
      name,
      userType,
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    });

    await user.save();

    generateTokenAndSetCookie(res, user._id);
    await sendVerificationEmail(user.email, verificationToken);
     
    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });

    logger.info(`User signed up successfully: ${email}`);

  } catch (error) {
    next(error);
    logger.error(`Error during signup for email: ${email}, Error: ${error.message}`);
  }
  
};



export const verifyEmail = async (req, res) => {
  const { code } = req.body;

  try {
    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired verification code" });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    await user.save();

    await sendWelcomeEmail(user.email, user.name);

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });

  } catch (error) {
    console.log("error in verifyEmail", error);
    next(error);
  }
  
};




export const login = async (req, res) => {

  const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return next(new CustomError(400, "Invalid credentials" ));
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
    logger.info(`User logged out successfully: ${email}`);
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
      return next(new CustomError(400, "User not found with this email"));
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000;

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = resetTokenExpiresAt;
    await user.save();

    const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    await sendPasswordResetEmail(user.email, resetURL);


    res.status(200).json({ success: true, message: "Password reset link sent to your email" });

  } catch (error) {
    console.log("Error in forgotPassword", error);
    next(error);
  }
};





export const resetPassword = async (req, res) => {

  const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return next(new CustomError(400, "Invalid or expired reset token" ));
      logger.warn(`Password reset failed for email: ${user.email}`);
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();

    await sendResetSuccessEmail(user.email);

    logger.info(`Password reset successful for email: ${user.email}`);
    res.status(200).json({ success: true, message: "Password reset successful" });

  } catch (error) {
    console.log("Error in resetPassword", error);
    next(error);
    logger.error(`Error during password reset for email: ${email}, Error: ${error.message}`);
  }
  
};






export const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return  next(new CustomError(400, "User not found"));
    }

    res.status(200).json({ success: true, user });

  } catch (error) {
    console.log("Error in checkAuth", error);
    next(error);
  }
};





