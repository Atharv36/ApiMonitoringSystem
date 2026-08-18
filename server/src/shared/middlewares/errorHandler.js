import logger from "../config/logger.js";

import ResponseFormatter from "../utils/ResponseFormatter.js";

const errorHandler = (error, req, res, next) => {
    let statusCode = error.statusCode || 500
    let message = error.message || "Internal Server Error"
    let errors = error.errors || null
    
    
    if (error.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation Error';
        errors = Object.values(error.errors).map((e) => e.message);
    } else if (error.name === 'MongoServerError' && error.code === 11000) {
        statusCode = 409;
        message = 'Duplicate Key Error';
    } else if (error.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid Token'
    } else if (error.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token Expired';
    };
logger.error('Error occured: ', {
        message: error.message,
        statusCode,
        stack: error.stack,
        path: req.path,
        method: req.method
    });

    res.status(statusCode).json(ResponseFormatter.error(message, statusCode, errors))
}

export default errorHandler