const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");

const users = [
	{
		_id: "1",
		name: "Alistair Rae",
		username: "alistair",
		email: "alistair@mail.com",
		password: "123456",
	},
	{
		_id: "2",
		name: "Amalthea Johnson",
		username: "amalthea",
		email: "thea@mail.com",
		password: "123456",
	},
];

const posts = [
	{
		_id: "1",
		content: "This is a sample post",
		tags: ["JavaScript", "GraphQL"],
		imgUrl: "http://example.com/image.jpg",
		authorId: "1",
		comments: [
			{
				content: "Great post!",
				username: "amalthea",
				createdAt: "2024-11-11T12:00:00Z",
				updatedAt: "2024-11-11T12:00:00Z",
			},
		],
		likes: [
			{
				username: "alistair",
				createdAt: "2024-11-11T12:00:00Z",
				updatedAt: "2024-11-11T12:00:00Z",
			},
		],
		createdAt: "2024-11-11T12:00:00Z",
		updatedAt: "2024-11-11T12:00:00Z",
	},
];

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

const resolvers = {
	Query: {
		getUser: (_, { id }) => {
			console.log(`Fetching user with id: ${id}`);
			return users.find((user) => user._id === id);
		},
		getPosts: () => {
			return posts;
		},
	},
	Mutation: {
		createUser: (_, { name, username, email, password }) => {
			const newUser = {
				_id: String(users.length + 1),
				name,
				username,
				email,
				password,
			};
			users.push(newUser);
			return newUser;
		},
		createPost: (_, { content, tags, imgUrl, authorId }) => {
			const newPost = {
				_id: String(posts.length + 1),
				content,
				tags,
				imgUrl,
				authorId,
				comments: [],
				likes: [],
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};
			posts.push(newPost);
			return newPost;
		},
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