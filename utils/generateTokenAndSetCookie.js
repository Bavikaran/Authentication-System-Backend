import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (res, userId, userType) => {
    const token = jwt.sign({ userId, userType }, process.env.JWT_SECRET, {
        expiresIn: "7d", // Token expires in 7 days
    });

    res.cookie("token", token, {
        httpOnly: true, // Prevents JavaScript access to cookie
        secure: process.env.NODE_ENV === "production", // Use HTTPS in production
        sameSite: "strict", // Protects against CSRF
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
    });

    return token;
};
