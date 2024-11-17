const { MongoClient, ServerApiVersion } = require("mongodb");
require('dotenv').config();

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	},
});

let db;

async function connectToDB() {
	if (!db) {
		try {
			await client.connect();
			db = client.db("linkedin");
			console.log("Connected to MongoDB!");
		} catch (error) {
			console.error("MongoDB connection error:", error);
			throw error;
		}
	}
	return db;
}

async function closeConnection() {
	if (client && client.isConnected()) {
		await client.close();
		console.log("MongoDB connection closed");
	}
}

module.exports = { connectToDB, closeConnection, client };
