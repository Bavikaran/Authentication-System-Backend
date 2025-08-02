import express from 'express';  
import { connectDB } from './db/connectDB.js'; 
import dotenv from 'dotenv'; 
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.route.js';
import errorHandler from './middleware/errorHandler.js';

dotenv.config();
const app = express(); 

app.use(cors({
  origin: 'http://localhost:5173',
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