const ErrorHandler = require('../utils/errorHandler');

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";

    // wrong object Id mongodb error
    if (err.name === "CastError") {
        const message = `Resource not found. Invalid: ${err.path}`;
        err = new ErrorHandler(message, 400);
    }

    //Mongoose duplicate key error ---when you try set same email as a register
    if (err.code === 11000) {
        const message = `Duplicate ${Object.keys(err.keyValue)} Entered`
        err = new ErrorHandler(message, 400);
    }

    //wrong JWT error
    if (err.name === "jsonWebTokenError") {
        const message = `Json web token invalid, Try again`
        err = new ErrorHandler(message, 400);
    }

    // JWT Expire error
    if (err.name === "TokenExpiredError") {
        const message = `Json web token Expire, Try again`
        err = new ErrorHandler(message, 400);
    }


    res.status(err.statusCode).json({
        success: false,
        message: err.message,
        stack: err.stack
    });
};