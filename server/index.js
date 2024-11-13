const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const { userTypeDefs, userResolvers } = require("./schemas/user");
const { postTypeDefs, postResolvers } = require("./schemas/post");
const { connectToDB, closeConnection } = require("./config/mongodb");
require('dotenv').config();


const typeDefs = `
    ${userTypeDefs}
    ${postTypeDefs}
`;

const resolvers = {
	Query: {
		...userResolvers.Query,
		...postResolvers.Query,
	},
	Mutation: {
		...userResolvers.Mutation,
		...postResolvers.Mutation,
	},
};

async function startServer() {
	try {
		await connectToDB();

		const server = new ApolloServer({
			typeDefs,
			resolvers,
		});

		const { url } = await startStandaloneServer(server, {
			listen: { port: 3000 },
		});
		console.log(`🚀  Server ready at: ${url}`);

		process.on("SIGINT", async () => {
			await closeConnection();
			process.exit(0);
		});
		process.on("SIGTERM", async () => {
			await closeConnection();
			process.exit(0);
		});
	} catch (error) {
		console.error("Failed to start server:", error);
		await closeConnection();
		process.exit(1);
	}
}

startServer();
