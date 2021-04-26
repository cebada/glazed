const router = require('express').Router();
const orderService = require('../services/orderService');
const { authenticateUser, checkRole } = require('../services/utils');

// Orders Routes

router.route('/')
    .post(authenticateUser, checkRole(['customer']), orderService.createOrder)
    .get(authenticateUser, checkRole(['customer']), orderService.getOrders);

router.route('/:id')
    .delete(authenticateUser, checkRole(['customer']), orderService.cancelOrder);


module.exports = router;