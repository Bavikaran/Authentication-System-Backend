import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  let token;
  const authHeader = req.headers.Authorization || req.headers.authorization;
  if(authHeader && authHeader.startsWith('Bearer')){
    token = authHeader.split(' ')[1];
  
  if(!token) return res.status(401).json({success: false, message: "Unauthorized - no token provided"});

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    
    req.userId = decoded.userId;
    console.log("Decoded userId:", req.userId);
    next();

  } catch (error) {
    console.log("Error in verifyToken", error);
    return res.status(400).json({ success:false, message: "Invalid Token"});
  }
    
  } else {
    return res.status(401).json({ success: false, message: "Unauthorized - no token provided" });
  }

};