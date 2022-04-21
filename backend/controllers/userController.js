const User = require('../models/userModel');
const catchAsyncErrors = require('../middleWare/catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler');
const sendEmail = require('../utils/sendEmail.js');
const crypto = require('crypto');


exports.newUserData = catchAsyncErrors(async (req, res, next) => {
    // const {email} = req.body;
    // const confirmEmailcheck = `${req.protocol}://${req.get("host")}/api/v1/register`;
    // const message = `Your email checks : \n\n ${confirmEmailcheck} \n\n if you have not requested this email then, please ignore it`;
    // try {
    //     await sendEmail({
    //         email: email,
    //         subject: `Ecommerce Site password recovery`,
    //         message
    //     })

    //     res.status(200).json({
    //         success: true,
    //         message: `Email sent to ${email} successfully`
    //     })

    // } catch (error) {

    //     return next(new ErrorHandler(error.message, 500));
    // }
    
});


//Register User
exports.registerUser = catchAsyncErrors(async (req, res, next) => {

    const { name, email, password } = req.body;


    const user = await User.create({
        name,
        email,
        password,
        avatar: {
            public_id: "this is public_id",
            url: "this is url",
        },
    });


    //creating token
    const token = user.getJWTtoken();
    // console.log(token);

    //cookie te store korar jnno options create kora hocce
    const options = {
        expires: new Date(Date.now() + process.env.COOKIE_EXPIRE + 24 * 60 * 60 * 1000),
        httpOnly: true,
    };

    //token saving in cookie//headers and cookie er modde set kora hocce
    res.status(201).cookie("token", token, options).json({
        success: true,
        token,
        user
    });

});


//Login User
exports.loginUser = catchAsyncErrors(async (req, res, next) => {

    const { email, password } = req.body;

    // checking if user given email and password both
    if (!email || !password) {
        return next(new ErrorHandler("Please Enter Email and Password correctly", 401));
    }


    //ei kane findOne er modde password dewa hoi nai krn upore jei password entered kora hobe and database e jei hash kora password ace 2 ta match hobe na and tkn user o asbe na.
    const user = await User.findOne({ email }).select("+password"); //select("password") mane holo password tao jate database tekhe select kore ane krn ei ta userModel select false ace..user er modde password tai show hobe ekn krn select("+password") diye ei ta k alada kore select kore dice jate compare korte pare password ta..select("+password") na dile user e password chara baki info gula takbe

    if (!user) {
        return next(new ErrorHandler("Invalid email or passord", 401));
    }

    // await ace tai jotokkn na password match hocce totokkn porer code kaj korbe na
    const isPasswordMatched = await user.comparePassword(password);// entered password ta ei kanei kaj hobe database e ace kina 

    if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid email or password", 401));
    }

    //creating token
    const token = user.getJWTtoken();

    //cookie te store korar jnno options create kora hocce
    const options = {
        expires: new Date(Date.now() + process.env.COOKIE_EXPIRE + 24 * 60 * 60 * 1000),
        httpOnly: true,
    };

    //token saving in cookie//headers and cookie er modde set kora hocce
    res.status(200).cookie("token", token, options).json({
        success: true,
        token,
        user
    });

});


//Logout User
exports.logoutUser = catchAsyncErrors(async (req, res, next) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
    })

    res.status(200).json({
        success: true,
        message: "User logged out"
    });
});


//Forgot Password
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new ErrorHandler("User no found", 404));
    }

    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`;

    const message = `Your password reset token is : \n\n ${resetPasswordUrl} \n\n if you have not requested this email then, please ignore it`;


    try {
        await sendEmail({
            email: user.email,
            subject: `Ecommerce Site password recovery`,
            message
        })

        res.status(200).json({
            success: true,
            message: `Email sent to ${user.email} successfully`
        })

    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });

        return next(new ErrorHandler(error.message, 500));
    }
});

//Reset Password
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {

    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    //find reset token in database
    const user = await User.findOne({ resetPasswordToken, resetPasswordExpire: { $gt: Date.now() } });

    if (!user) {
        return next(new ErrorHandler("Reset password token is invalid or has been expired", 400));
    }

    if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler("Password does not match", 400));
    }

    user.password = req.body.password;//password chnaged here
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();


    const token = user.getJWTtoken();
    const options = {
        expires: new Date(Date.now() + process.env.COOKIE_EXPIRE + 24 * 60 * 60 * 1000),
        httpOnly: true,
    };
    res.status(201).cookie("token", token, options).json({
        success: true,
        token,
        user
    });
});


//Get User Details
exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
    // console.log(req.user);
    const user = await User.findById(req.user._id);

    res.status(200).json({
        success: true,
        user,
    });
});

//Update User Password
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user._id).select("+password");

    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);
    if (!isPasswordMatched) {
        return next(new ErrorHandler("Old Password is incorrect", 400));
    }

    if (req.body.newPassword !== req.body.confirmPassword) {
        return next(new ErrorHandler("Password does not match", 400));
    }

    user.password = req.body.newPassword;

    await user.save();

    const token = user.getJWTtoken();
    const options = {
        expires: new Date(Date.now() + process.env.COOKIE_EXPIRE + 24 * 60 * 60 * 1000),
        httpOnly: true,
    };
    res.status(201).cookie("token", token, options).json({
        success: true,
        token,
        user
    });

});

//Update User Profile
exports.updateUserProfile = catchAsyncErrors(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
    };

    const user = await User.findByIdAndUpdate(req.user._id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success: true,
        user
    });
});


//Get All User-----Admin
exports.getAllUsers = catchAsyncErrors(async (req, res, next) => {
    const users = await User.find();
    res.status(200).json({
        success: true,
        users,
    });
});

//Get single User Info-----Admin
exports.getSingleUserInfo = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorHander(`User does not exist with Id: ${req.params.id}`));
    }

    res.status(200).json({
        success: true,
        user,
    });
});

//Update User Role --- Admin
exports.updateUserRole = catchAsyncErrors(async (req, res, next) => {
    const newUserData = {
        role: req.body.role,
    };

    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    })

    res.status(200).json({
        success: true,
        user,
    });
});

//Delete User ----- Admin
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorHander(`User does not exist with Id: ${req.params.id}`));
    }

    await user.remove();

    res.status(200).json({
        success: true,
        message: "User Deleted Successfully",
    });
});