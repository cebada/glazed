const router = require('express').Router();
const storeService = require('../services/storeService');
const { authenticateUser, checkRole } = require('../services/utils');


router.route('/')
    .post(authenticateUser, checkRole(['admin']), storeService.createStore)
    .get(authenticateUser, checkRole(['customer']), storeService.getAllStores);

router.route('/:id/schedules')
    .post(authenticateUser, checkRole(['admin']), storeService.createStoreSchedule);

router.route('/schedules/:sId')
    .patch(authenticateUser, checkRole(['admin']), storeService.updateSchedule);

router.route('/:id/:date')
    .get(authenticateUser, checkRole(['customer']), storeService.getStoreAvailability);



module.exports = router;