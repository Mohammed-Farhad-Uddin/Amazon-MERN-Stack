const express = require("express");
const { registerUser, loginUser, logoutUser, forgotPassword, resetPassword, getUserDetails, updatePassword, updateUserProfile, getAllUsers, getSingleUserInfo, updateUserRole, deleteUser, newUserData } = require("../controllers/userController");
const { isAuthenticated } = require("../middleWare/auth");


const router = express.Router();

router.route('/new').post(newUserData);

router.route('/register').post(registerUser);

router.route('/login').post(loginUser);

router.route('/logout').get(logoutUser);

router.route('/password/forgot').post(forgotPassword);

router.route('/password/reset/:token').put(resetPassword);

router.route('/me').get(isAuthenticated, getUserDetails);

router.route('/password/update').put(isAuthenticated, updatePassword);

router.route('/me/update').put(isAuthenticated, updateUserProfile);

router.route('/admin/users').get(isAuthenticated, getAllUsers);

router.route('/admin/user/:id').get(isAuthenticated, getSingleUserInfo).put(isAuthenticated, updateUserRole).delete(isAuthenticated, deleteUser);

module.exports = router;