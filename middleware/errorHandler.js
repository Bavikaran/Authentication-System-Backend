import CustomError from '../utils/customError.js';  // Import the custom error class

const errorHandler = (err, req, res, next) => {
  // Clone the error object to avoid direct mutation
  let error = { ...err };
  error.message = err.message;

  // Log the error (you can use winston or any other logging tool here)
  console.error(err);

  // Set default status code to 500 if not specified in the error
  error.statusCode = error.statusCode || 500;

  // Send error response with the appropriate status code and message
  res.status(error.statusCode).json({
    success: false,
    message: error.message || 'Server Error',
  });
};

export default errorHandler;