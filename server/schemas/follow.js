const Follow = require("../models/Follow");

const followTypeDefs = `#graphql


type Follow {
    _id: ID
    followingId: ID
    followerId: ID
    createdAt: String
    updatedAt: String
}

type Query {
    followers(userId: ID!): [Follow]
    following(userId: ID!): [Follow]
    followersCount(userId: ID!): Int
    followingCount(userId: ID!): Int
}

type Mutation {
    followUser(followerId: ID!, followingId: ID!): Follow
}

input FollowerInput{
    followerId: ID!
    followingId: ID!
}

input FollowingInput{
    followingId: ID!
    followerId: ID!
}`;

const followResolvers = {
	Query: {
		followers: async (_, { userId }, { auth }) => {
			auth();
			const followers = await Follow.findAllUserFollowers(userId);
			return followers;
		},
		following: async (_, { userId }, { auth }) => {
			auth();
			const following = await Follow.findAllUserFollowing(userId);
			return following;
		},
		followersCount: async (_, { userId }, { auth }) => {
			auth();
			const followers = await Follow.countFollowers(userId);
			return followers;
		},
		followingCount: async (_, { userId }, { auth }) => {
			auth();
			const following = await Follow.countFollowing(userId);
			return following;
		},
	},
	Mutation: {
		followUser: async (_, { followerId, followingId }, { auth }) => {
			auth();
			const follow = await Follow.createFollow(followerId, followingId);
			return follow;
		},
	},
};

module.exports = {
	followTypeDefs,
	followResolvers,
};
