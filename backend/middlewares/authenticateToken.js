const jwt = require('jsonwebtoken')


function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
        return res.status(401).json({ message: "Authorization header missing" });
    }

    const token = authHeader.split(' ')[1];

    if (token == null) { return res.status(401).json({ message: "Token: null" }); }
    
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Token is invalid" });
        }

        req.user = decoded;
        next();
    });
}

module.exports = {
    authenticateToken
}