import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";



const typeDefs = `#graphql
    type User {
        _id: ID!
        name: String!
        username: String!
        email: String!
        password: String!
    }

    type Post {
        _id: ID!
        content: String!
        tags: [String]
        imgUrl: String
        authorId: ID!
        comments: [Comment]
        likes: [Like]
        createdAt: String
        updatedAt: String
    }

    type Comment {
        content: String!
        username: String!
        createdAt: String
        updatedAt: String
    }

    type Like {
        username: String!
        createdAt: String
        updatedAt: String
    }

    type Follow {
        followingId: ID
        followerId: ID
        createdAt: String
        updatedAt: String
    }

    type Query {
        getUser(id: ID!): User
        getPosts: [Post]
    }

    type Mutation {
        createUser(name: String!, username: String!, email: String!, password: String!): User
        createPost(content: String!, tags: [String], imgUrl: String, authorId: ID!): Post
    }
`;



const server = new ApolloServer({
	typeDefs,
	resolvers,
});

const { url } = await startStandaloneServer(server, {
	listen: { port: 3000 },
});
console.log(`🚀 Server ready at ${url}`);
