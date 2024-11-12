const Post = require("../models/Post");

const posts = [
	new Post(),
];

const postTypeDefs = `
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
        createPost(content: String!, tags: [String], imgUrl: String, authorId: ID!): Post
        updatePost(id: ID!, content: String, tags: [String], imgUrl: String): Post
        deletePost(id: ID!): String
    }
`;

const postResolvers = {
	Query: {
		getPosts: () => posts,
		getPostById: (_, { id }) => posts.find((post) => post._id === id),
	},
    
	Mutation: {
		createPost: (_, { content, tags, imgUrl, authorId }) => {
            const newPost = new Post(
                String(posts.length + 1),
                content,
                tags,
                imgUrl,
                authorId
            );
            posts.push(newPost);
            return newPost;
        },

        updatePost: (_, { id, content, tags, imgUrl }) => {
            const postIndex = posts.findIndex(post => post._id === id);
            if (postIndex === -1) throw new Error('Post not found');
            
            const post = posts[postIndex];
            if (content) post.content = content;
            if (tags) post.tags = tags;
            if (imgUrl) post.imgUrl = imgUrl;
            return post;
        },

        deletePost: (_, { id }) => {
            const postIndex = posts.findIndex(post => post._id === id);
            if (postIndex === -1) throw new Error('Post not found');
            
            posts.splice(postIndex, 1);
            return 'Post deleted';
        }
	},
};

module.exports = { postTypeDefs, postResolvers };
