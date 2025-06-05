// Centralized error handling middleware for Express
const errorHandler = (err, req, res, next) => {
  // Log the error stack (or the error itself if stack is unavailable)
  console.error('Error:', err.stack || err);

  // Send a JSON response with error details
  res.status(err.statusCode || 500).json({
    success: false, // Indicates the request failed
    message: err.message || 'Internal Server Error', // Default message if none provided
  });
};

// Export the error handler for use in the main app
module.exports = {
  errorHandler,
};
