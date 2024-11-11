import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

const typeDefs = `
    type Query {
        hello: String
    }
`;

const resolvers = {
	Query: {
		hello: () => "Hello, world!",
	},
};

const server = new ApolloServer({
	typeDefs,
	resolvers,
});

const { url } = await startStandaloneServer(server, {
	listen: { port: 3000 },
});
console.log(`🚀 Server ready at ${url}`);
