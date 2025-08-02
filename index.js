import express from 'express';  
import { connectDB } from './db/connectDB.js'; 
import dotenv from 'dotenv'; 
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.route.js';
import errorHandler from './middleware/errorHandler.js';
import helmet from 'helmet';


dotenv.config();
const app = express(); 

const allowedOrigins = [
  'http://localhost:5173',
  'https://lms-lk-hgctffa9dndwebap.southindia-01.azurewebsites.net',
  'http://localhost:5175',
  'https://web-frontend-pl5j.onrender.com'];

app.use(helmet()); 

// Example of setting custom security headers
app.use((req, res, next) => {
  // Strict-Transport-Security (HSTS): forces HTTPS connections for one year
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  // Content Security Policy (CSP): Allow content from trusted sources only
  res.setHeader('Content-Security-Policy', "default-src 'self'; img-src 'self'; script-src 'self'");

  // X-Content-Type-Options: Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // X-Frame-Options: Prevent clickjacking by disallowing the site to be embedded in an iframe
  res.setHeader('X-Frame-Options', 'DENY');

  // X-XSS-Protection: Enable cross-site scripting (XSS) filter
  res.setHeader('X-XSS-Protection', '1; mode=block');

  next();  // Proceed to the next middleware
});


app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true
}));

const PORT = process.env.PORT || 5000; 

app.use(express.json()); 
app.use(cookieParser());
app.use('/api/auth', authRoutes); 

app.use(errorHandler);

app.listen(PORT, () => {
  connectDB(); 
  console.log("Server running on port:", PORT);
});
