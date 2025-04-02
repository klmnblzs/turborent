const { pool } = require('./dbUtils');
const jwt = require('jsonwebtoken');

async function generateRefreshToken(userId) {
    if (!userId) {
        res.status(500).json({ error: "User id is required!" })
    }

    const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
    try {
        await pool.execute(
            'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
            [userId, refreshToken, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]
        );

        return refreshToken;
    } catch (err) {
        console.error(err);
        throw new Error("Couldn't add the refresh token to the database!");
    }
}

module.exports = {
    generateRefreshToken
}