require("dotenv").config();
const jwt = require("jsonwebtoken");
const JWT_SECRET = "your_secret_key_here";

if (!JWT_SECRET) {
	console.error("JWT_SECRET not set");
	process.exit(1);
}

const signToken = (payload) => jwt.sign(payload, JWT_SECRET);
const verifyToken = (token) => {
	try {
		return jwt.verify(token, JWT_SECRET);
	} catch (error) {
		console.error("Error verifying token:", error.message);
		throw new Error("Invalid or malformed token.");
	}
};

module.exports = { signToken, verifyToken };
