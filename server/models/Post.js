const { connectToDB } = require("../config/mongodb");
const { ObjectId } = require("mongodb");
const redis = require("../config/redis");

class Post {
	static async findAll() {
		try {
			const db = await connectToDB();
			const posts = await db
				.collection("Post")
				.aggregate([
					{
						$lookup: {
							from: "User",
							localField: "authorId",
							foreignField: "_id",
							as: "author",
						},
					},
					{
						$unwind: { path: "$author", preserveNullAndEmptyArrays: true },
					},
					{
						$project: {
							_id: 1,
							content: 1,
							tags: 1,
							imgUrl: 1,
							comments: 1,
							likes: 1,
							createdAt: 1,
							updatedAt: 1,
							"author._id": 1,
							"author.username": 1,
							"author.name": 1,
						},
					},
				])
				.toArray();

			if (!posts || posts.length === 0) {
				throw new Error("No posts found");
			}

			return posts;
		} catch (error) {
			throw new Error("Failed to fetch posts: " + error.message);
		}
	}
	static async findById(id) {
		try {
			console.log("Fetching post with ID:", id);
			const db = await connectToDB();
			const post = await db
				.collection("Post")
				.aggregate([
					{
						$match: {
							_id: new ObjectId(id),
						},
					},
					{
						$lookup: {
							from: "User",
							localField: "authorId",
							foreignField: "_id",
							as: "author",
						},
					},
					{
						$unwind: { path: "$author", preserveNullAndEmptyArrays: true },
					},
					{
						$project: {
							_id: 1,
							content: 1,
							tags: 1,
							imgUrl: 1,
							comments: 1,
							likes: 1,
							createdAt: 1,
							updatedAt: 1,
							"author._id": 1,
							"author.username": 1,
							"author.name": 1,
						},
					},
				])
				.toArray();

			console.log("Fetched Post:", post);
			return post[0];
		} catch (error) {
			console.error("Failed to fetch post by ID:", error);
			throw new Error("Failed to fetch post");
		}
	}
	
	static async createPost({ content, tags, imgUrl, authorId }) {
		try {

			const db = await connectToDB();
			const newPost = await db.collection("Post").insertOne({
				content,
				tags,
				imgUrl,
				authorId,
				comments: [],
				likes: [],
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			});
			console.log("New Post:", newPost);			

			return {
				_id: newPost.insertedId,
				content,
				tags,
				imgUrl,
				authorId,
				comments: [],
				likes: [],
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};
		} catch (error) {
			throw new Error("Failed to create post: " + error.message);
		}
	}

	static async getComments(postId) {
		try {
			const db = await connectToDB();
			const post = await db
				.collection("Post")
				.findOne({ _id: new ObjectId(postId) });

			if (!post) {
				throw new Error("Post not found");
			}

			return post.comments;
		} catch (error) {
			throw new Error("Failed to fetch comments: " + error.message);
		}
	}

	static async likePost({ postId, username }) {
		try {
			const db = await connectToDB();
			const like = {
				username,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};

			await db
				.collection("Post")
				.updateOne({ _id: new ObjectId(postId) }, { $push: { likes: like } });

			return like;
		} catch (error) {
			throw new Error("Failed to like post: " + error.message);
		}
	}

	static async commentPost({ postId, content, username }) {
		try {
			const db = await connectToDB();
			const newComment = {
				content,
				username,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};

			await db
				.collection("Post")
				.updateOne(
					{ _id: new ObjectId(postId) },
					{ $push: { comments: newComment } }
				);

			return newComment;
		} catch (error) {
			throw new Error("Failed to comment on post: " + error.message);
		}
	}
}

module.exports = Post;
