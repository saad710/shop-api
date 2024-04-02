const User = require('../models/User');
const jwt = require('jsonwebtoken');


//only_token_verify_and_find_user_from_req
const verifyToken = async (req, res, next) => {
    const token = req.headers['authorization'];
    console.log({token})
    if (!token) {
        return res.status(401).json({ error: 'Access denied. Token is required.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ error: 'Invalid token.' });
        }
        req.user = user;
        next();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err });
    }
};

//access_authorization_user
const verifyTokenAndAuthorization = async (req, res, next) => {
    try {
        await verifyToken(req, res, () => {
            if (req.user.id === req.params.id || req.user.isAdmin) {
                next();
            } else {
                res.status(403).json('You are not allowed to do that!');
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err });
    }
};

//check_admin_authorization
const verifyTokenAndAdmin = async (req, res, next) => {
    try {
        await verifyToken(req, res, () => {
            if (req.user.isAdmin) {
                next();
            } else {
                res.status(403).json('You are not allowed to do that!');
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err });
    }
};

 module.exports = {
    verifyToken,
    verifyTokenAndAuthorization,
    verifyTokenAndAdmin,
  };
  