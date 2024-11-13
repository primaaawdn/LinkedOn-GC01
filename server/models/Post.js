const { connectToDB } = require("../config/mongodb");
const { ObjectId } = require("mongodb");
class Post {
	static async findAll() {
		try {
			const db = await connectToDB();
			const posts = await db.collection("Post").find().sort({ createdAt: -1 }).toArray(); 
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
    static async createPost({ content, tags, imgUrl, authorId }){
        try {
            const db = await connectToDB();
            const newPost = await db.collection("Post").insertOne({
                content,
                tags,
                imgUrl,
                authorId: new ObjectId(authorId),
                comments: [],
                likes: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
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
            }
        } catch (error) {
            throw new Error("Failed to create post");
        }
    }
}

module.exports = Post;
