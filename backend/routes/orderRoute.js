const express = require("express");
const { getSingleOrder, makeOrder, myOrders, getAllOrders, updateOrder, deleteOrder } = require("../controllers/orderController");
const { isAuthenticated, authorizeRole } = require("../middleWare/auth");
const router = express.Router();


router.route('/order/new').post(isAuthenticated, makeOrder);

router.route('/order/:id').get(isAuthenticated, getSingleOrder);

router.route('/orders/myOrder').get(isAuthenticated, myOrders);

router.route('/admin/orders').get(isAuthenticated, authorizeRole("admin"), getAllOrders);

router.route('/admin/order/:id').put(isAuthenticated, authorizeRole("admin"), updateOrder).delete(isAuthenticated, authorizeRole("admin"), deleteOrder);;


module.exports = router;