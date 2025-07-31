import express from 'express';  //express is the main web framework used to create HTTP servers in Node.js.
import { connectDB } from './db/connectDB.js'; //connectDB is a custom function (you likely defined in db/connectDB.js) used to connect to MongoDB
import dotenv from 'dotenv'; // import enviorment variable
import cors from 'cors';
import cookieParser from 'cookie-parser';

dotenv.config(); // Load environment variables from .env file
const app = express(); // Create an instance of an Express application

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

const PORT = process.env.PORT || 5000; //define server port

app.use(express.json()); // Middleware to parse JSON request bodies
app.use(cookieParser());



app.listen(PORT, () => {// expree server port
  connectDB(); // connect db
  console.log("Server running on port:", PORT);// console message
});