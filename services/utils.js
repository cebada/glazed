const jwt = require('jsonwebtoken');

/*module.exports = function (req, res, next) {//authenticateToken (req, res, next) {
    const token = req.header('auth-token');
    if (!token) return res.status(401).send('Access denied!');

    try {
        req.user = jwt.verify(token, process.env.SECRET_KEY);
        next();
    }catch (error){
        res.status(400).send('Invalid token');
    }
}*/

//module.exports.authenticateToken = authenticateToken;

//TODO refreshToken JWT

//TODO 401 ou 403?
function authenticateToken (req, res, next) {
    const bearerToken = req.header('authorization');

    if (!bearerToken) return res.status(401).send('Access denied!');

    try {
        const bearer = bearerToken.split(' ');
        const token = bearer[1];
        req.user = jwt.verify(token, process.env.SECRET_KEY);
        next();
    }catch (error){
        res.status(401).send('Invalid token'); //TODO 400 ou 401 ou 403?
    }
}


module.exports.authenticateToken = authenticateToken;