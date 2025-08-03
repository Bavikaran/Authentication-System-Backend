import express from 'express';  
import { connectDB } from './db/connectDB.js'; 
import dotenv from 'dotenv'; 
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.route.js';
import errorHandler from './middleware/errorHandler.js';

dotenv.config();
const express = require('express');
const app = express(); 
const dotenv = require("dotenv");

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

swaggerDocs(app);
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:$5000`);
  console.log(`Swagger docs available at http://localhost:$5000/api-docs`);
});


app.listen(PORT, () => {
  connectDB(); 
  console.log("Server running on port:", PORT);
});
