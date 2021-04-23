const router = require('express').Router();
const Store = require('../models/Store');
const storeService = require('../services/storeService');
const {authenticateToken} = require('../services/utils');


router.route('/')
    .post(authenticateToken,storeService.createStore);


module.exports = router;