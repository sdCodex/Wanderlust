const express=require('express');
const router=express.Router({mergeParams:true});
const Listing=require('../models/listing.js');
const wrapAsync=require('../utils/wrapAsync.js');
const ExpressError=require('../utils/ExpressError.js');
const {reviewSchema}=require('../schema.js');
const Review=require('../models/review.js');
const {isLoggedIn,validateReview,isReviewAuthor}=require('../middleware.js');
const { postReview, destroyReview } = require('../controllers/review.js');
// //Validation Middleware for Review

// const validateReview=(req,res,next)=>{
//     let {error}=reviewSchema.validate(req.body);
//     if(error)
//     {
//         let errMsg=error.details.map((el)=>{
//             const cleanedMessage=el.message.replace(/^"review\./, '')
//             .replace(/"/g, ''); ;
//             return cleanedMessage.charAt(0).toUpperCase()+cleanedMessage.slice(1);
//         }).join(",");
//         throw new ExpressError(400,errMsg);
//     }
//     next();
// }



//Reviews  post route
router.post("/",isLoggedIn,validateReview,wrapAsync(postReview));


//Reviews delete route
router.delete("/:reviewId",isLoggedIn,isReviewAuthor,wrapAsync(destroyReview));


module.exports=router;