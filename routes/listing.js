const express=require('express');
const router=express.Router();
const Listing=require('../models/listing.js');
const wrapAsync=require('../utils/wrapAsync.js');
const ExpressError=require('../utils/ExpressError.js');
const {listingSchema}=require('../schema.js');
const {isLoggedIn, isOwner, validateListing}=require('../middleware.js');
const {index, newListingForm, saveNewListing, showListing, editForm, updateListing, deleteListing}=require('../controllers/listing.js');
const multer  = require('multer');
const {cloudinary,storage}=require('../cloudConfig.js');
const upload = multer({storage});

//Validation Middleware for new listing and update listing

// const validateListing=(req,res,next)=>{
//     let {error}=listingSchema.validate(req.body);
//     // console.log(error);
//     if(error)
//     {
//         let errMsg=error.details.map((el)=>{
//             const cleanedMessage=el.message.replace(/^"listing\./, '')
//             .replace(/"/g, ''); ;
//             return cleanedMessage.charAt(0).toUpperCase()+cleanedMessage.slice(1);
//         }).join(",");
//         throw new ExpressError(400,errMsg);
//     }
//     next();
// };




//Listings (get) and Create New Listing (Post)
router.route("/")
.get(wrapAsync(index))
.post(isLoggedIn,upload.single('listing[image]'),validateListing,
wrapAsync(saveNewListing));


//New Route
router.get("/new",isLoggedIn,newListingForm);


// Show Route (get), Update Route(patch), Delete(delete)
router.route("/:id")
.get(wrapAsync(showListing))
.patch(isLoggedIn,isOwner,upload.single('listing[image]'),validateListing,wrapAsync(updateListing))
.delete(isLoggedIn,isOwner,wrapAsync(deleteListing));

//Edit  Get Route

router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(editForm));

module.exports=router;