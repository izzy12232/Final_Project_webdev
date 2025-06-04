// middleware/validateHandler.js
const { validationResult } = require('express-validator');

const validateHandler = (handler, name) => {
  // First check if the handler is a function
  if (typeof handler !== 'function') {
    throw new TypeError(`Controller ${name} must be a function`);
  }

  // Return middleware function
  return async (req, res, next) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false,
          errors: errors.array() 
        });
      }

      // Execute the handler
      await handler(req, res, next);
    } catch (err) {
      next(err);
    }
  };
};

module.exports = validateHandler;