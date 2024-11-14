const Post = require("../models/Post");
const redis = require("../config/redis");
const { ObjectId } = require("mongodb");

const postTypeDefs = `#graphql
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
		author: User
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

    type Query {
        getPosts: [Post]
        getPostById(id: ID!): Post
		getComments(postId: ID!): [Comment]
    }

    type Mutation {
        addPost(content: String!, tags: [String], imgUrl: String, authorId: ID!): Post
        updatePost(id: ID!, content: String, tags: [String], imgUrl: String): Post
        deletePost(id: ID!): String
		commentPost(postId: ID!, content: String!, username: String!): Comment
		likePost(postId: ID!, username: String!): Like
    }
`;

const postResolvers = {
	Query: {
		getPosts: async () => {
			try {
				const postsRedis = await redis.get("posts");
				if (postsRedis) {
					console.log("Data Redis found:", JSON.parse(postsRedis));
					return JSON.parse(postsRedis);
				}

				const posts = await Post.findAll();
				redis.set("posts", JSON.stringify(posts));
				return posts;
			} catch (error) {
				console.log("🚀 ~ getPosts: ~ error:", error);
				throw new Error("Failed to fetch posts");
			}
		},
		getPostById: async (_, { id }) => {
			try {
				const post = await Post.findById(new ObjectId(id));
				return post;
			} catch (error) {
				console.log("🚀 ~ getPostById: ~ error:", error);
				throw new Error("Post not found");
			}
		},
		getComments: async (_, { postId }) => {
			try {
				return await Post.getComments(postId);
			} catch (error) {
				console.log("🚀 ~ getComments: ~ error:", error);
				throw new Error("Failed to fetch comments");
			}
		},
	},

	Mutation: {
		addPost: async (_, { content, tags, imgUrl, authorId }) => {
			try {
				const newPost = await Post.createPost({
					content,
					tags,
					imgUrl,
					authorId,
				});
				redis.del("posts");
				// console.log("Data Redis deleted");
				return newPost;
			} catch (error) {
				console.log("🚀 ~ addPost: ~ error:", error);
				throw new Error("Failed to create post");
			}
		},
		commentPost: async (_, { postId, content, username }) => {
			try {
				return await Post.commentPost({ postId, content, username });
			} catch (error) {
				console.log("🚀 ~ commentPost: ~ error:", error);
				throw new Error("Failed to comment post");
			}
		},

		likePost: async (_, { postId, username }) => {
			try {
				return await Post.likePost({ postId, username });
			} catch (error) {
				console.log("🚀 ~ likePost: ~ error:", error);
				throw new Error("Failed to like post");
			}
		},
	},
};

module.exports = { postTypeDefs, postResolvers };
