const jwt = require('jsonwebtoken')

function generateAccessToken(data) {
    return jwt.sign(data, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' })
}

module.exports = {
    generateAccessToken
}