// Import validationResult from express-validator to check for request validation errors
const { validationResult } = require('express-validator');

/**
 * Middleware wrapper to validate request and handle errors before passing control to the main controller.
 * @param {Function} handler - The controller function to execute if validation passes.
 * @param {string} name - The name of the controller function (for error messages).
 * @returns {Function} A wrapped middleware function that includes validation and error handling.
 */
const validateHandler = (handler, name) => {
  // Check if the handler is actually a function
  if (typeof handler !== 'function') {
    throw new TypeError(`Controller ${name} must be a function`);
  }

  // Return a new middleware function
  return async (req, res, next) => {
    try {
      // Perform validation on the request using express-validator
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        // Return a 400 Bad Request response if there are validation errors
        return res.status(400).json({ 
          success: false,
          errors: errors.array() 
        });
      }

      // If validation passes, call the original controller
      await handler(req, res, next);
    } catch (err) {
      // Pass any errors to the next error-handling middleware
      next(err);
    }
  };
};

// Export the validateHandler function for use in routes
module.exports = validateHandler;
