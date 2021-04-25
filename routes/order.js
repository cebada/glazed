const router = require('express').Router();
const orderService = require('../services/orderService');
const { authenticateUser, checkRole } = require('../services/utils');


router.route('/')
    .post(authenticateUser, checkRole(['customer']), orderService.createOrder);

router.route('/:id')
    .delete(authenticateUser, checkRole(['customer']), orderService.cancelOrder);


module.exports = router;