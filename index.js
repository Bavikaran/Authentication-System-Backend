import express from 'express';  
import { connectDB } from './db/connectDB.js'; 
import dotenv from 'dotenv'; 
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.route.js';

dotenv.config();
const app = express(); 

const allowedOrigins = [
  'http://localhost:5173',
  'https://lms-lk-hgctffa9dndwebap.southindia-01.azurewebsites.net',
  'http://localhost:5175',
  'https://web-frontend-pl5j.onrender.com'];

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

app.listen(PORT, () => {
  connectDB(); 
  console.log("Server running on port:", PORT);
});
