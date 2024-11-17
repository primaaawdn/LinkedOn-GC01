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
        addPost(content: String!, tags: [String], imgUrl: String): String
        updatePost(id: ID!, content: String, tags: [String], imgUrl: String): Post
        deletePost(id: ID!): String
		commentPost(postId: ID!, content: String!, username: String!): Comment
		likePost(postId: ID!, username: String!): Like
    }`;
const postResolvers = {
	Query: {
		getPosts: async (_, __, { auth }) => {
			try {
				auth();
				console.log("🚀 ~ getPosts: ~ auth:", auth());
				const postsRedis = await redis.get("posts");

				if (postsRedis) {
					// console.log("Data Redis found:", JSON.parse(postsRedis));
					return JSON.parse(postsRedis);
				}

				const posts = await Post.findAll();
				console.log(posts);

				redis.set("posts", JSON.stringify(posts));
				return posts;
			} catch (error) {
				console.log("🚀 ~ getPosts: ~ error:", error);
				throw new Error("Failed to fetch posts: " + error.message);
			}
		},
		getPostById: async (_, { id }, { auth }) => {
			try {
				auth();
				const post = await Post.findById(id);
				console.log("🚀 ~ getPostById: ~ post:", post);

				if (!post) {
					throw new Error("Post not found");
				}
				return {
					...post,
					tags: post.tags || [],
					imgUrl: post.imgUrl || null,
					author: post.author || null,
				};
			} catch (error) {
				console.log("🚀 ~ getPostById: ~ error:", error);
				throw new Error("Post not found: " + error.message);
			}
		},
		getComments: async (_, { postId }, { auth }) => {
			auth();
			try {
				return await Post.getComments(postId);
			} catch (error) {
				console.log("🚀 ~ getComments: ~ error:", error);
				throw new Error("Failed to fetch comments: " + error.message);
			}
		},
	},

	Mutation: {
		addPost: async (_, { content, tags, imgUrl, authorId }, { auth }) => {
			try {
				const user = auth();
				console.log("🚀 ~ addPost: ~ user:", user);

				if (!user) throw new Error("Unauthorized");

				const newPost = await Post.createPost({
					content,
					tags,
					imgUrl,
					authorId: new ObjectId(user._id),
				});

				await redis.del("posts");
				return newPost._id.toString();
			} catch (error) {
				console.error("🚀 ~ addPost: ~ error:", error);
				throw new Error("Failed to create post: " + error.message);
			}
		},
		commentPost: async (_, { postId, content, username }, { auth }) => {
			auth();
			try {
				return await Post.commentPost({ postId, content, username });
			} catch (error) {
				console.log("🚀 ~ commentPost: ~ error:", error);
				throw new Error("Failed to comment on post: " + error.message);
			}
		},
		likePost: async (_, { postId, username }, { auth }) => {
			auth();
			try {
				return await Post.likePost({ postId, username });
			} catch (error) {
				console.log("🚀 ~ likePost: ~ error:", error);
				throw new Error("Failed to like post: " + error.message);
			}
		},
		deletePost: async (_, { id }, { auth }) => {
			auth();
			try {
				await Post.deletePost(id);
				await redis.del("posts");
				redis.del("posts");
				return "Post deleted";
			} catch (error) {
				console.log("🚀 ~ deletePost: ~ error:", error);
				throw new Error("Failed to delete post: " + error.message);
			}
		},
	},
};

module.exports = { postTypeDefs, postResolvers };
