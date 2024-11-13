const { MongoClient, ServerApiVersion } = require("mongodb");
require('dotenv').config();

// Replace the placeholder with your Atlas connection string
const uri = process.env.MONGODB_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	},
});

// async function run() {
//   try {
//     // Connect the client to the server (optional starting in v4.7)
//     // await client.connect();

//     // Send a ping to confirm a successful connection
//     await client.db("linkedin").command({ ping: 1 });
//     console.log("Pinged your deployment. You successfully connected to MongoDB!");
//   } finally {
//     // Ensures that the client will close when you finish/error
//     await client.close();
//   }
// }
// run().catch(console.dir);
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
