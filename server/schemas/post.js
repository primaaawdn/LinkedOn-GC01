const Post = require("../models/Post");

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
    }

    type Mutation {
        addPost(content: String!, tags: [String], imgUrl: String, authorId: ID!): Post
        updatePost(id: ID!, content: String, tags: [String], imgUrl: String): Post
        deletePost(id: ID!): String
    }
`;

const postResolvers = {
	Query: {
		getPosts: async () => {
            try {
                return await Post.findAll();
            } catch (error) {
                console.log("🚀 ~ getPosts: ~ error:", error)
                throw new Error("Failed to fetch posts");
            }
		},
		getPostById: async (_, { id }) => {
			try {
				return await Post.findById(id);
			} catch (error) {
				console.log("🚀 ~ getPostById: ~ error:", error)
				throw new Error("Post not found");
			}
		}
	},

	Mutation: {
		addPost: async (_, { content, tags, imgUrl, authorId }) => {
			try {
				return await Post.createPost({ content, tags, imgUrl, authorId });
			} catch (error) {
				console.log("🚀 ~ addPost: ~ error:", error)
				throw new Error("Failed to create post");
			}
		},
	},
};

module.exports = { postTypeDefs, postResolvers };
