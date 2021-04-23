const router = require('express').Router();
const storeService = require('../services/storeService');
const { authenticateUser, checkRole } = require('../services/utils');


router.route('/')
    .post(authenticateUser, checkRole(['admin']), storeService.createStore);


module.exports = router;