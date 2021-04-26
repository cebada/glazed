const router = require('express').Router();
const authService = require('../services/authService');

// Authentication Routes

router.route('/register')
    .post(authService.registerUser);

router.route('/login')
    .post(authService.loginUser);

router.route('/logout')
    .post(authService.logout);


module.exports = router;