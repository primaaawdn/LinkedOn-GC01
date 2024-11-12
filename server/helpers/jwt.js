const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
const signToken = (payload) => jwt.sign(payload, JWT_SECRET);
const verifyToken = (token) => jwt.verify(token, JWT_SECRET);

module.exports = { signToken, verifyToken };