const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const { userTypeDefs, userResolvers } = require("./schemas/user");
const { postTypeDefs, postResolvers } = require("./schemas/post");
const { connectToDB, closeConnection } = require("./config/mongodb");
const { verifyToken } = require("./helpers/jwt");
require("dotenv").config();
require('./config/ngrok');


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

		startStandaloneServer(server, {
			listen: { port: 3000 },
			context: async ({ req }) => {
				return {
					auth: () => {
						const token = req.headers.authorization;
						if (!token) throw new Error("Unauthorized");
						const user = verifyToken(token);
						return user;
					},
				};
			},
		}).then(({ url }) => {
			console.log(`🚀  Server ready at: ${url}`);
		});

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
