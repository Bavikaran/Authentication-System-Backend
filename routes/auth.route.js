import express from "express"; 
import { signup,login,logout,verifyEmail,forgotPassword,resetPassword,checkAuth } from "../controllers/auth.controller.js"; 
import { verifyToken } from "../middleware/verifyToken.js";
import sanitizeInput from "../middleware/sanitizeInput.js";
const router = express.Router();


router.get("/check-auth", verifyToken, checkAuth);
router.post("/signup",sanitizeInput, signup); 
router.post("/login",sanitizeInput, login);
router.post("/logout", logout);

router.post("/verify-email", verifyEmail);
router.post("/forgot-password", forgotPassword);

router.put("/reset-password/:token", resetPassword);

export default router;