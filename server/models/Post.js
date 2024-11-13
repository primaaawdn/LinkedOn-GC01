const { connectToDB } = require("../config/mongodb");
const { ObjectId } = require("mongodb");
class Post {
	static async findAll() {
		try {
			const db = await connectToDB();
			const posts = await db.collection("Post").find().toArray();
			return posts;
		} catch (error) {
			throw new Error("Failed to fetch posts");
		}
	}
	static async findById(id) {
		try {
			const db = await connectToDB();
            const postId = new ObjectId(id);
			const post = await db.collection("Post").findOne({ _id: postId });
			if (!post) throw new Error("Post not found");
			return post;
		} catch (error) {            
			console.log("🚀 ~ Post ~ findById ~ error:", error)
			throw new Error("Post not found");
		}
	}
}

module.exports = Post;
