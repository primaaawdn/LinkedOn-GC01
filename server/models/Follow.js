const { ObjectId } = require("mongodb");
const { connectToDB } = require("../config/mongodb");

class Follow {
	static async findAllUserFollowers(userId) {
		const database = await connectToDB();
		const followCollection = database.collection("Follow");

		const followers = await followCollection
			.aggregate([
				{
					$match: {
						followingId: new ObjectId(userId),
					},
				},
				{
					$lookup: {
						from: "User",
						localField: "followerId", 
						foreignField: "_id", 
						as: "followerDetails", 
					},
				},
				{
					$unwind: "$followerDetails", 
				},
				{
					$project: {
						_id: 1,
						followerId: 1,
						followingId: 1,
						createdAt: 1,
						updatedAt: 1,
						followerName: "$followerDetails.name",
						followerUsername: "$followerDetails.username", 
						followerImage: "$followerDetails.image", 
					},
				},
			])
			.toArray();

		return followers;
	}

	static async findAllUserFollowing(userId) {
		const database = await connectToDB();
		const followCollection = database.collection("Follow");

		const following = await followCollection
			.aggregate([
				{
					$match: {
						followerId: new ObjectId(userId),
					},
				},
				{
					$lookup: {
						from: "User", 
						localField: "followingId", 
						foreignField: "_id",
						as: "followingDetails",
					},
				},
				{
					$unwind: "$followingDetails", 
				},
				{
					$project: {
						_id: 1,
						followerId: 1,
						followingId: 1,
						createdAt: 1,
						updatedAt: 1,
						followingName: "$followingDetails.name", 
						followingUsername: "$followingDetails.username", 
						followingImage: "$followingDetails.image",
					},
				},
			])
			.toArray();

		return following;
	}

	static async countFollowing(userId) {
		const database = await connectToDB();
		const followCollection = database.collection("Follow");

		try {
			const result = await followCollection
				.aggregate([
					{
						$match: {
							followerId: new ObjectId(userId),
						},
					},
					{
						$count: "totalFollowing",
					},
				])
				.toArray();

			return result[0]?.totalFollowing || 0;
		} catch (error) {
			throw new Error("Following not found");
		}
	}

	static async countFollowers(userId) {
		const database = await connectToDB();
		const followCollection = database.collection("Follow");

		try {
			const result = await followCollection
				.aggregate([
					{
						$match: {
							followingId: new ObjectId(userId),
						},
					},
					{
						$count: "totalFollowers",
					},
				])
				.toArray();

			return result[0]?.totalFollowers || 0;
		} catch (error) {
			throw new Error("Followers not found");
		}
	}

	static async createFollow(followerId, followingId) {
		const database = await connectToDB();
		const followCollection = database.collection("Follow");

		const alreadyFollowed = await followCollection.findOne({
			followerId: new ObjectId(followerId),
			followingId: new ObjectId(followingId),
		});

		if (alreadyFollowed) {
			throw new Error("You already followed this user");
		}

		const newFollow = {
			followerId: new ObjectId(followerId),
			followingId: new ObjectId(followingId),
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		const result = await followCollection.insertOne(newFollow);

		return {
			...newFollow,
			_id: result.insertedId,
		};
	}
}

module.exports = Follow;
