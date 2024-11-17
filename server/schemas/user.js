const User = require("../models/User");

const userTypeDefs = `
    type User {
        _id: ID!
        name: String!
        username: String!
        email: String!
        password: String!
        image: String
        occupation: String
        bio: String
    }

    type AuthPayload {
        user: User!
        token: String!
    }

    type Query {
        getUsers: [User]
        getUser(id: ID!): User
        searchUser(query: String!): [User]
    }

    type Mutation {
        addUser(name: String!, username: String!, email: String!, password: String!): User
        loginUser(username: String!, password: String!): AuthPayload
        updateUser(id: ID!, name: String, username: String, email: String, password: String, image: String, occupation: String, bio: String): User
        deleteUser(id: ID!): String
    }`
;

const userResolvers = {
	Query: {
		getUsers: async () => {
			try {
				return await User.findAll();
			} catch (error) {
				console.log("🚀 ~ getUsers: ~ error:", error);
				throw new Error("Failed to fetch users");
			}
		},
		getUser: async (_, { id }) => {
			try {
				return await User.findById(id);
			} catch (error) {
				console.log("🚀 ~ getUser: ~ error:", error);
				throw new Error("User not found");
			}
		},

		searchUser: async (_, { query }) => {
			try {
				return await User.search(query);
			} catch (error) {
				console.log("🚀 ~ searchUser: ~ error:", error);
				throw new Error("Failed to search user");
			}
		},
	},

	Mutation: {
		addUser: async (_, { name, username, email, password }) => {
			try {
				const newUser = await User.createUser({
					name,
					username,
					email,
					password,
				});
				return newUser;
			} catch (error) {
				throw new Error(error.message);
			}
		},

		loginUser: async (_, { username, password }) => {
			try {
				const user = await User.findByUsername(username);
				if (!user) throw new Error("User not found");

				const isPasswordValid = await User.validatePassword(
					user.password,
					password
				);
				if (!isPasswordValid) throw new Error("Invalid password");

				const token = await User.generateToken(user);
				return { user, token };
			} catch (error) {
				console.log("🚀 ~ loginUser: ~ error:", error);
				throw new Error("Failed to login");
			}
		},
	},
};

module.exports = { userTypeDefs, userResolvers };