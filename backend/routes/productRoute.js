const express = require("express");
const { getAllProducts, createProduct, updateProduct, deleteProduct, getSingleProductDetails, createNewReview, deleteReview, getProductReviews } = require("../controllers/productController");
const { isAuthenticated, authorizeRole } = require("../middleWare/auth");


const router = express.Router();


router.route('/product/create').post(isAuthenticated, createProduct);
router.route('/products').get(getAllProducts);
router.route('/product/:id').get(getSingleProductDetails).put(isAuthenticated, authorizeRole("admin"), updateProduct).delete(isAuthenticated, authorizeRole("admin"), deleteProduct);

router.route('/review/create').put(isAuthenticated, createNewReview);
router.route('/reviews').get(getProductReviews).delete(isAuthenticated, deleteReview);//ei gular aghe /product dile error ashe krn upore /product/:id k call kore de,, mane product er por ja dibe ta id hisabe count korbe

module.exports = router;