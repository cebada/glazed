const router = require('express').Router();
const authService = require('../services/authService');



router.route('/register')
    .post(authService.registerUser);

router.route('/login')
    .post(authService.loginUser);




module.exports = router;