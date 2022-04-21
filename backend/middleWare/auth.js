const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("./catchAsyncErrors");
const jwt = require("jsonwebtoken");
const User = require('../models/userModel');


exports.isAuthenticated = catchAsyncErrors(async (req, res, next) => {
    //sudhu token dile value property 2 tai asbe r {token} dile just value tai asbe
    const { token } = req.cookies;//cookie parser package ei ta store kore rakhe
    // console.log(token);

    if (!token) {
        return next(new ErrorHandler("Please Login to access this resource", 401));
    }

    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    // console.log(decodedData);

    req.user = await User.findById(decodedData.id);
    // console.log(req.user);

    next(); //next ei tar tarporer function e move kore dibe ,,example hisabe create product e aghe holo isAuthenticated then authorizeRole then createProduct,,,ei kaner next() ta authorizeRole e move korbe abr authorizeRole er next() ta createProduct function e move hobe,, eikane next() na dile isAuthenticate function and tarporer function gula ek sathe call hobe,, ek ta complete kore arekta function e jawar jnno next() dewa hoice
});



////////////////////////////////
exports.authorizeRole = (...roles) => {
    return (req, res, next) => {
        if (roles.includes(req.user.role)) {
            next();
        } else {
            return next(new ErrorHandler(`Role :${req.user.role} does not allow to access this resource`, 403));
        }
    }
};