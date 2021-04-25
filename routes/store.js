const router = require('express').Router();
const storeService = require('../services/storeService');
const { authenticateUser, checkRole } = require('../services/utils');


router.route('/')
    .post(authenticateUser, checkRole(['admin']), storeService.createStore)
    .get(authenticateUser, checkRole(['customer']), storeService.getAllStores)
    .delete(storeService.deleteAll);            // helper function

router.route('/:id/orders')
    .post(authenticateUser, checkRole(['customer']), storeService.createOrder);

router.route('/:id/schedules')
    .post(authenticateUser, checkRole(['admin']), storeService.createStoreSchedule);

router.route('/schedules/:sId')
    .patch(authenticateUser, checkRole(['admin']), storeService.updateSchedule);

router.route('/:id/availability/:date')
    .get(authenticateUser, checkRole(['customer']), storeService.getStoreAvailability);


router.route('/')
    .delete(storeService.deleteAll);


module.exports = router;