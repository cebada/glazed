const router = require('express').Router();
const storeService = require('../services/storeService');
const { authenticateUser, checkRole } = require('../services/utils');


router.route('/')
    .post(authenticateUser, checkRole(['admin']), storeService.createStore)
    .get(authenticateUser, checkRole(['customer']), storeService.getAllStores)
    .delete(storeService.deleteAll);            // helper function

router.route('/:id/schedules')
    .post(authenticateUser, checkRole(['admin']), storeService.createStoreSchedule);

router.route('/:id/schedules/:day')
    .get(authenticateUser, checkRole(['customer']), storeService.getStoreSchedule);

router.route('/')
    .delete(storeService.deleteAll);


module.exports = router;