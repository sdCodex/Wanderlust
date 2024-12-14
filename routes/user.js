const express=require('express');
const router=express.Router();
const User=require('../models/user.js');
const wrapAsync = require('../utils/wrapAsync');
const passport=require('passport');
const { saveRedirectUrl } = require('../middleware.js');
const {signupForm, saveUser, loginForm, authentication, logout}=require('../controllers/user.js')


//Signup Form (Get) and User registration (Post)
router.route("/signup")
.get(signupForm)
.post(wrapAsync(saveUser));


//Login Form (Get) and Authentication (Post)
router.route("/login")
.get(loginForm)
.post(saveRedirectUrl,passport.authenticate('local', {failureRedirect: '/login',failureFlash:true}),authentication);

//Logout
router.get("/logout",logout);

module.exports=router;