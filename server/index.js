const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const { userTypeDefs, userResolvers } = require("./schemas/user");
const { postTypeDefs, postResolvers } = require("./schemas/post");

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

const server = new ApolloServer({
	typeDefs,
	resolvers,
});

startStandaloneServer(server, {
	listen: { port: 3000 },
}).then(({ url }) => {
	console.log(`🚀  Server ready at: ${url}`);
});