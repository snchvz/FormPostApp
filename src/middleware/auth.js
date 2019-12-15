const jwt = require('jsonwebtoken');
const User = require('../models/user');

const auth = async(req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ','');
        const decoded = jwt.verify(token, process.env.JWT_SIGNATURE);
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token });

        if (!user)
        {
            throw new Error();
        }

        //we add properties req.token and req.user so that the route handlers
        //can have access to them after we call next()
        req.token = token;
        req.user = user;    
        next();
        
    } catch(e) {
        res.status(401).send({error: "please authenticate"});
    }
}

module.exports = auth;