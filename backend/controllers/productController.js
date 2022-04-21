const Product = require('../models/productModel');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middleWare/catchAsyncErrors');
const ApiFeaturs = require('../utils/apiFeatures');


//Create Product
exports.createProduct = catchAsyncErrors(async (req, res, next) => {

    req.body.user = req.user.id;

    const product = await Product.create(req.body);//await holo jotokkn na promise fullfil fill hocce means resolved ba reject na hocce totokkn porjontho wait koro porer line e jawar jnno

    // console.log(product);

    res.status(201).json({
        success: true,
        product
    });
});



//Get All Products
exports.getAllProducts = catchAsyncErrors(async (req, res, next) => {

    const productPerPage = 6;
    const productsCount = await Product.countDocuments();

    const apiFeaturs = new ApiFeaturs(Product.find(), req.query).search().filter().pagination(productPerPage);

    const products = await apiFeaturs.collectionQuery;

    res.status(200).json({
        success: true,
        products,
        productsCount
    });
});


//Update Product ---- Admin
exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        return next(new ErrorHandler("Product not found", 404));
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: true
    });

    res.status(201).json({
        success: true,
        product
    });
});

//Delete Product ---- Admin
exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        return next(new ErrorHandler("Product not found", 404));
    }

    await product.remove();

    res.status(200).json({
        success: true,
        message: 'Product successfully removed'
    })
});


//Get Single Product Details
exports.getSingleProductDetails = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorHandler("Product not found", 404));
    }

    res.status(200).json({
        success: true,
        product
    });
});


//=========== Review =============================
exports.createNewReview = catchAsyncErrors(async (req, res, next) => {
    const { rating, comment, productId } = req.body;

    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment
    };

    const product = await Product.findById(productId);

    const isReviewed = product.reviews.find((rev) => rev.user.toString() === req.user._id.toString());

    if (isReviewed) {
        product.reviews.forEach((review) => {
            if (review.user.toString() === req.user._id.toString) {
                review.rating = rating,
                    review.comment = comment
            }
        })
    } else {
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length;
    }

    let avg = 0;

    product.reviews.forEach((review) => {
        avg = avg + review.rating;
    });

    product.ratings = avg / product.reviews.length;

    await product.save({ validateBeforeSave: false });

    res.status(200).json({ success: true });
});


//Get Product Reviews ----- Admin
exports.getProductReviews = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.query.id);
    if (!product) {
        return next(new ErrorHandler("Product not found", 404));
    }

    res.status(200).json({
        success: true,
        reviews: product.reviews
    });
});

//Delete Reviews ----- Admin
exports.deleteReview = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.query.productId);

    if (!product) {
        return next(new ErrorHandler("Product not found", 404));
    }

    const reviews = product.reviews.filter(review => review._id.toString() !== req.query.id.toString());

    product.reviews = reviews;

    let avg = 0;

    reviews.forEach(review => {
        avg += review.rating;
    });

    if (reviews.length === 0) {//last review delete korle avg/0 hobe mane length=0 tkn undefined asbe tai error ta k solve korar jnno length 0 hole ratings k 0 kore dewa hocce
        product.ratings = 0;
    } else {
        product.ratings = avg / reviews.length;
    }

    product.numOfReviews = reviews.length;

    await product.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,
        product
    });
});