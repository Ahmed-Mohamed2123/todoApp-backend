const jwt = require('jsonwebtoken');

exports.checkAuth = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        jwt.verify(token, process.env.SECRET_TOKEN, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }
            req.user = user;
            
            next();
        });
    } catch(error) {
        res.status(401).json({
            message: "Auth failed!"
        })
    }

};

exports.checkRoleAdmin = (req, res, next) => {
    let admin = 'admin';
    if (req.user['role'].some(role => role === admin)) {
        next();
    } else {
        res.status(403).json({
            message: 'This Resource Is Forbidden',
        }) 
    }
};
