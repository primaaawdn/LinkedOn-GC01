require('dotenv').config();
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    console.error('JWT_SECRET not set');
    process.exit(1);
}

const signToken = (payload) => jwt.sign(payload, JWT_SECRET);
const verifyToken = (token) => jwt.verify(token, JWT_SECRET);

module.exports = { signToken, verifyToken };