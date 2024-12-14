const Listing=require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken=process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });
const cloudinary = require('cloudinary').v2;


module.exports.index=async(req,res)=>{
    
    const allListings = await Listing.find({});
    res.render("listings/index.ejs",{allListings});
}

module.exports.newListingForm=(req,res)=>{
    res.render("listings/new");
}

module.exports.saveNewListing=async(req,res,next)=>{
    let response= await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1
      }).send();

    let url=req.file.path;
    let filename=req.file.filename;
    const property=new Listing(req.body.listing);
    property.owner=req.user._id;
    property.image={url,filename};
    property.geometry=response.body.features[0].geometry;
    let savedListing=await property.save();
    console.log(savedListing);
    req.flash("success","New Listing Created!");
    res.redirect("/listings");
}

module.exports.showListing=async(req,res,next)=>{
    
    let {id}=req.params;
    let info=await Listing.findById(id).populate({path: "reviews", populate : {path: "author"}}).populate("owner");
    if(!info)
    {
        req.flash("error","Listing not found!!");
        res.redirect("/listings");
    }
    else
    {
        res.render("listings/show",{info});
    } 
}


module.exports.editForm=async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    if(!listing)
    {
        req.flash("error","Listing does not exist");
        res.redirect("/listings");
    }
    else
    {
        let originalImageUrl=listing.image.url;
        let modifiedImage=originalImageUrl.replace("/upload","/upload/c_thumb,h_250,w_250");
        res.render("listings/edit",{listing,modifiedImage});
    }
}


module.exports.updateListing=async(req,res)=>{
    let {id}=req.params;
    let prevListing=await Listing.findById(id);
    let currFilename=prevListing.image.filename;
   
    let listing=await Listing.findByIdAndUpdate(id, {...req.body.listing}, {runValidators:true});

    if(typeof req.file != "undefined")
    {
        let url=req.file.path;
        let filename=req.file.filename;
        listing.image={url,filename};

        cloudinary.api
        .delete_resources(currFilename, 
        { type: 'upload', resource_type: 'image' });

        listing.save();
    }
    req.flash("success","Listing Updated!!");
    res.redirect(`/listings/${id}`);
}


module.exports.deleteListing=async(req,res)=>{
    let {id}=req.params;
    let listing=await Listing.findByIdAndDelete(id);
    let filename=listing.image.filename;

    cloudinary.api
    .delete_resources(filename, 
    { type: 'upload', resource_type: 'image' });

    req.flash("success","Listing Deleted");
    res.redirect("/listings");
}