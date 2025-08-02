import express from "express"; 
import { signup,login,logout,verifyEmail,forgotPassword,resetPassword,checkAuth } from "../controllers/auth.controller.js"; 
import { verifyToken } from "../middleware/verifyToken.js";
import sanitizeInput from "../middleware/sanitizeInput.js";
import {body} from 'express-validator';



const router = express.Router();


router.get("/check-auth", verifyToken, checkAuth);


router.post("/signup",
    body('name').isString().notEmpty(),
    body('email').isEmail().normalizeEmail(),  
    body('password').isLength({ min: 6 }),
    sanitizeInput, signup); 


router.post("/login",
    body('email').isEmail().normalizeEmail(),  
    body('password').isLength({ min: 6 }),
    sanitizeInput, login);


router.post("/logout", logout);


router.post("/verify-email", verifyEmail);


router.post("/forgot-password",
    body('email').isEmail().normalizeEmail(),  
    forgotPassword);


router.put("/reset-password/:token", 
    body('password').isLength({ min: 6 }),
    body('confirmPassword').custom((value, { req }) => value === req.body.password).withMessage('Passwords must match'),
    resetPassword);



export default router;