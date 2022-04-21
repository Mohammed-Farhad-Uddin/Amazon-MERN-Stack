const mongoose = require('mongoose');
const validator = require('validator');//ei package install kora hoice email validate korar jnno
const bcrypt = require('bcryptjs');//ei package install kora lagbe password encypt korar jnno
const jwt = require('jsonwebtoken');//ei package install kora lagbe user token store kore rakhar jnno 
const crypto = require('crypto');//ei package build in package jei ta install kora lage nai.

const validateEmail = function (email) {
    var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email)
};




const userSchema = new mongoose.Schema({
    name: {
        type: 'String',
        required: [true, "Please Enter Your Name"],
        minLength: [4, "Name Should be more than 4 characters"],
        maxLength: [20, "Name should not exceed 20 characters"]
    },
    email: {
        type: 'String',
        trim: true,
        unique: true,
        required: [true, "Please Enter Your Email"],
        validate: [validateEmail, 'Please fill a valid email address'],//validate specifies a function to be called for validation (doesn't need to use regexes), match specifies a validation regex directly
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    password: {
        type: 'String',
        required: [true, "Please Enter Your Password"],
        minLength: [4, "Password should be more than 4 characters"],
        select: false //select false takle jkn user k get korbo ba find({}), tkn jate password ta na ashe tai select false dewa hoice..ekn password chara model el onnanno info gula show hobe
    },
    role: {
        type: 'String',
        default: 'user'
    },
    avatar: {
        public_id: {
            type: 'String',
            required: true,
        },
        url: {
            type: 'String',
            required: true,
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
});


//Password will encrypt before save userSchema----- 
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }
    this.password = await bcrypt.hash(this.password, 10)//10 holo koto long power er encrypted password create hobe,,joto power toto strong password

    // if (this.isModified("password")) {
    //     this.password = await bcrypt.hash(this.password, 10)//10 holo koto power er encrypted password create hobe,,joto power toto strong password
    // } else {
    //     next();
    // }
});

//JWT Token ---user er token generate kore methods er maddome pass kora hocce
userSchema.methods.getJWTtoken = function () {// ei method ta  userController er user er modde takbe
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE })
};


//Compared Password ,login user pass and database password
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}



//Generating Reset Password token
userSchema.methods.getResetPasswordToken =  function () {

    // Generating token
    const resetToken = crypto.randomBytes(20).toString("hex");
    // console.log(resetToken);

    //hashing and adding resetPasswordtoken userSchema
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    return resetToken;
};





module.exports = mongoose.model("User", userSchema);