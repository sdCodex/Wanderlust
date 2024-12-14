const Listing=require("./models/listing.js");
const Review=require("./models/review.js");
const ExpressError=require('./utils/ExpressError.js');
const {listingSchema,reviewSchema}=require('./schema.js');


module.exports.isLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated())
    {
        req.session.redirectUrl=req.originalUrl;
        req.flash("error","You must be logged in");
        return res.redirect("/login");
    }

    next();
}


module.exports.saveRedirectUrl=(req,res,next)=>{
    if(req.session.redirectUrl)
    {
        res.locals.redirectUrl=req.session.redirectUrl;
    }
    next();
}


module.exports.isOwner=async(req,res,next)=>{
    let {id}=req.params;
    let listing = await Listing.findById(id).populate("owner");
    let currUser=res.locals.currUser;
    console.log(currUser.username);
    console.log(listing.owner.username);
    if(currUser && !currUser._id.equals(listing.owner._id))
    {
        req.flash("error","Permission Denied!!!");
        return res.redirect(`/listings/${id}`);
    }

    next();
}


//Validation Middleware for new listing and update listing

module.exports.validateListing=(req,res,next)=>{
    let {error}=listingSchema.validate(req.body);
    // console.log(error);
    if(error)
    {
        let errMsg=error.details.map((el)=>{
            const cleanedMessage=el.message.replace(/^"listing\./, '')
            .replace(/"/g, ''); ;
            return cleanedMessage.charAt(0).toUpperCase()+cleanedMessage.slice(1);
        }).join(",");
        throw new ExpressError(400,errMsg);
    }
    next();
}



//Validation Middleware for Review

module.exports.validateReview=(req,res,next)=>{
    let {error}=reviewSchema.validate(req.body);
    if(error)
    {
        let errMsg=error.details.map((el)=>{
            const cleanedMessage=el.message.replace(/^"review\./, '')
            .replace(/"/g, ''); ;
            return cleanedMessage.charAt(0).toUpperCase()+cleanedMessage.slice(1);
        }).join(",");
        throw new ExpressError(400,errMsg);
    }
    next();
}



module.exports.isReviewAuthor=async(req,res,next)=>{
    let {id,reviewId}=req.params;
    let review = await Review.findById(reviewId);
    let currUser=res.locals.currUser;
    if(currUser && !currUser._id.equals(review.author))
    {
        req.flash("error","Permission Denied!!!");
        return res.redirect(`/listings/${id}`);
    }

    next();
}
