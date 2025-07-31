import mongoose from "mongoose"; // mongoose library import

export const connectDB = async () => {       //async is uded to connect db
  try {  //Starts a try block to catch any errors that might occur while trying to connect to the database
    console.log("mongo_uri:", process.env.MONGO_URI);//Logs the value of the environment variable MONGO_URI to the console. Helpful for debugging to make sure the MongoDB URI is loaded correctly from the .env file.

    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1); // Exit process with failure (1 = failure, 0 = success)
  }
};