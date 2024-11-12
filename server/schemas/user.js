const { hashPassword } = require('../helpers/bcrypt');
const User = require('../models/User');

const users = [
    new User("1", "Alistair Rae", "alistair", "alistair@mail.com", "123456"),
    new User("2", "Amalthea Johnson", "amalthea", "thea@mail.com", "123456"),
];

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
        updateUser(id: ID!, name: String, username: String, email: String, password: String): User
        deleteUser(id: ID!): String
    }
`;

const userResolvers = {
    Query: {
        getUser: (_, { id }) => users.find(user => user._id === id),
        getUsers: () => users,
    },

    Mutation: {
        addUser: (_, { name, username, email, password }) => {
            const newUser = new User(
                String(users.length + 1),
                name,
                username,
                email,
                hashPassword(password),
            );
            users.push(newUser);
            return newUser;
        },

        updateUser: (_, { id, name, username, email, password }) => {
            const userIndex = users.findIndex(user => user._id === id);
            if (userIndex === -1) throw new Error('User not found');
            
            users[userIndex] = {
                ...users[userIndex],
                name: name || users[userIndex].name,
                username: username || users[userIndex].username,
                email: email || users[userIndex].email,
                password: password || users[userIndex].password,
            };
            return users[userIndex];
        },

        deleteUser: (_, { id }) => {
            const userIndex = users.findIndex(user => user._id === id);
            if (userIndex === -1) throw new Error('User not found');
            
            users.splice(userIndex, 1);
            return 'User deleted';
        }
    },
};

module.exports = { userTypeDefs, userResolvers };