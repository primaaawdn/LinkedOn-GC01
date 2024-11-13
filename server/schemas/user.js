const { hashPassword, comparePassword } = require("../helpers/bcrypt");
const { signToken } = require("../helpers/jwt");
const User = require("../models/User");
const { connectToDB } = require("../config/mongodb");
const { ObjectId } = require("mongodb");

const userTypeDefs = `
    type User {
        _id: ID!
        name: String!
        username: String!
        email: String!
        password: String!
    }

    type AuthPayload {
        user: User!
        token: String!
    }

    type Query {
        getUser(id: ID!): User
        getUsers: [User]
    }

    type Mutation {
        addUser(name: String!, username: String!, email: String!, password: String!): User
        loginUser(username: String!, password: String!): AuthPayload
        searchUser(query: String!): [User]
        updateUser(id: ID!, name: String, username: String, email: String, password: String): User
        deleteUser(id: ID!): String
    }
`;

const userResolvers = {
	Query: {
		getUser: async () => {
			try {
				const db = await connectToDB();
				const user = await db.collection("User").findOne({ _id: ObjectId(id) });
				return user;
			} catch (error) {
				throw new Error("User not found");
			}
		},

		getUsers: async () => {
			try {
				const db = await connectToDB();
				const users = await db.collection("User").find().toArray();
				return users;
			} catch (error) {
				throw new Error("Failed to fetch users");
			}
		},
	},

	Mutation: {
		addUser: async (_, { name, username, email, password }) => {
			try {
				const db = await connectToDB();
				const existingUser = await db
					.collection("User")
					.findOne({ $or: [{ username }, { email }] });

				if (existingUser) throw new Error("User already exists");

				const hashedPassword = await hashPassword(password);
				const newUser = await db.collection("User").insertOne({
					name,
					username,
					email,
					password: hashedPassword,
				});
				return {
					_id: newUser.insertedId,
					name,
					username,
					email,
					password: hashedPassword,
				};
			} catch (error) {
				console.log(error);
				throw new Error("Failed to create user");
			}
		},
		loginUser: async (_, { username, password }) => {
			try {
				const db = await connectToDB();
				const user = await db.collection("User").findOne({ username });
				if (!user) throw new Error("User not found");

				const isPasswordValid = await comparePassword(password, user.password);
				if (!isPasswordValid) throw new Error("Invalid password");

				const token = signToken({ _id: user._id, username: user.username });
				return { user, token };
			} catch (error) {
				console.log(error);
				throw new Error("Failed to login");
			}
		},
        
		searchUser: async (_, { query }) => {
			try {
				const db = await connectToDB();
				const users = await db
					.collection("User")
					.find({
						$or: [
							{ name: { $text: { $search: query } }},
							{ username: { $text: { $search: query } }},
						],
					})
					.toArray();

				return users;
			} catch (error) {
				console.log(error);
				throw new Error("Failed to search users");
			}
		},
        
	},
};

module.exports = { userTypeDefs, userResolvers };
