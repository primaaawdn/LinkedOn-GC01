import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	Image,
	ActivityIndicator,
	StyleSheet,
	TextInput,
	TouchableOpacity,
} from "react-native";
import { useQuery, useMutation } from "@apollo/client";
import gql from "graphql-tag";
// import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";

const GET_POST_DETAIL = gql`
	query GetPostById($getPostByIdId: ID!) {
		getPostById(id: $getPostByIdId) {
			content
			tags
			imgUrl
			comments {
				content
				username
				createdAt
				updatedAt
			}
			likes {
				username
				createdAt
				updatedAt
			}
			createdAt
			updatedAt
			author {
				_id
				username
				name
			}
		}
	}
`;

const ADD_COMMENT = gql`
	mutation CommentPost($postId: ID!, $content: String!, $username: String!) {
		commentPost(postId: $postId, content: $content, username: $username) {
			content
			username
			createdAt
			updatedAt
		}
	}
`;

const ADD_LIKE = gql`
	mutation LikePost($postId: ID!, $username: String!) {
		likePost(postId: $postId, username: $username) {
			username
			createdAt
		}
	}
`;

const PostDetail = ({ navigation }) => {
	const [postId, setPostId] = useState(null);
	const [commentContent, setCommentContent] = useState("");
	const [username, setUsername] = useState("");
	const [hasLiked, setHasLiked] = useState(false);

	const { data, loading, error } = useQuery(GET_POST_DETAIL, {
        skip: !postId,
        variables: { getPostByIdId: postId },
    });

	const [addComment] = useMutation(ADD_COMMENT);
	const [addLike] = useMutation(ADD_LIKE);

	useEffect(() => {
		const fetchPostId = async () => {
			try {
				const storedPostId = await SecureStore.getItemAsync("viewedPostId");
				if (storedPostId) {
					setPostId(storedPostId);
				}
			} catch (e) {
				console.error("Error fetching postId from SecureStore:", e);
			}
		};

		fetchPostId();
	}, []);

	useEffect(() => {
		if (data && data.getPostById) {
			const post = data.getPostById;
			const userHasLiked = post.likes.some(
				(like) => like.username === username
			);
			setHasLiked(userHasLiked);
		}
	}, [data, username]);

	const handleAddComment = async () => {
		if (!commentContent || !username) return;

		try {
			const newComment = {
				content: commentContent,
				username,
				createdAt: new Date().toISOString(),
			};

			await addComment({
				variables: {
					postId,
					content: commentContent,
					username,
				},
				optimisticResponse: {
					commentPost: newComment,
				},
				update: (cache, { data }) => {
					const newCommentData = data.commentPost;
					const existingData = cache.readQuery({
						query: GET_POST_DETAIL,
						variables: { getPostByIdId: postId },
					});

					cache.writeQuery({
						query: GET_POST_DETAIL,
						variables: { getPostByIdId: postId },
						data: {
							getPostById: {
								...existingData.getPostById,
								comments: [
									...existingData.getPostById.comments,
									newCommentData,
								],
							},
						},
					});
				},
			});

			setCommentContent("");
		} catch (err) {
			console.error("Error adding comment:", err);
		}
	};

	const handleLikePost = async () => {
		if (hasLiked) {
			return;
		}

		try {
			setHasLiked(true);
			await addLike({
				variables: {
					postId,
					username,
				},
			});
		} catch (err) {
			console.error("Error liking post:", err);
			setHasLiked(false);
		}
	};

	if (!postId || loading) {
		return (
			<View style={styles.center}>
				<ActivityIndicator size="large" color="#0000ff" />
			</View>
		);
	}

	if (error) {
		console.error("Error loading post detail:", error);
		return <Text>Error loading post details</Text>;
	}

	const post = data.getPostById;

	const formatDate = (isoString) => {
		const date = new Date(isoString);

		const options = {
			day: "2-digit",
			month: "short",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
			hour12: false,
		};

		return new Intl.DateTimeFormat("en-US", options).format(date);
	};

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<TouchableOpacity>
					<Text style={styles.headerText}>Post Detail</Text>
				</TouchableOpacity>
				<TouchableOpacity onPress={() => navigation.goBack()}>
					<Ionicons name="close" size={24} color="#FFFFFF" />
				</TouchableOpacity>
			</View>

			<View style={styles.postContainer}>
				<Image
					source={{ uri: post.imgUrl || "https://via.placeholder.com/150" }}
					style={styles.postImage}
				/>
				<Text style={styles.postContent}>{post.content}</Text>

				<View style={styles.authorAndDateContainer}>
					<View style={styles.authorContainer}>
						<Text style={styles.postAuthor}>Author: {post.author.name}</Text>
						<Text style={styles.postDate}>
							{formatDate(post.createdAt)}
						</Text>
					</View>

					<TouchableOpacity style={styles.likeButton} onPress={handleLikePost}>
						<Ionicons
							name={hasLiked ? "heart" : "heart-outline"}
							size={20}
							color={hasLiked ? "#0077B5" : "#0077B5"}
						/>
						<Text style={styles.likeButtonText}>{post.likes.length}</Text>
					</TouchableOpacity>
				</View>

				{/* Comments Section */}
				<View style={styles.commentsContainer}>
					<Text style={styles.commentTitle}>Comments:</Text>
					{post.comments.length === 0 ? (
						<Text>No comments yet.</Text>
					) : (
						post.comments.map((comment) => (
							<View key={comment.createdAt} style={styles.comment}>
								<Text style={styles.commentUsername}>{comment.username}</Text>
								<Text style={styles.commentContent}>{comment.content}</Text>
								<Text style={styles.commentDate}>
									{formatDate(comment.createdAt)}
								</Text>
							</View>
						))
					)}
				</View>

				{/* Add Comment Form */}
				<TextInput
					style={styles.input}
					placeholder="Write a comment..."
					value={commentContent}
					onChangeText={setCommentContent}
				/>
				<TouchableOpacity
					style={styles.commentButton}
					onPress={handleAddComment}>
					<Text style={styles.commentButtonText}>Add Comment</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#E9E9E9",
		// padding: 15,
	},
	header: {
		backgroundColor: "#0077B5",
		padding: 15,
		paddingVertical: 20,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	headerText: {
		fontSize: 20,
		color: "#FFFFFF",
		fontWeight: "bold",
		marginLeft: 15,
	},
	postContainer: {
		backgroundColor: "#FFFFFF",
		padding: 20,
		borderRadius: 10,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 5,
		elevation: 4,
		margin: 15,
	},
	postImage: {
		width: "100%",
		height: 200,
		borderRadius: 10,
	},
	postContent: {
		fontSize: 16,
		marginVertical: 10,
	},
	authorAndDateContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	authorContainer: {
		flex: 1,
	},
	postAuthor: {
		fontWeight: "bold",
	},
	postDate: {
		fontSize: 12,
		color: "#777",
	},
	likeButton: {
		flexDirection: "row",
		alignItems: "center",
	},
	likeButtonText: {
		fontSize: 16,
		marginLeft: 5,
	},
	commentsContainer: {
		marginTop: 20,
	},
	commentTitle: {
		fontWeight: "bold",
		fontSize: 18,
		marginBottom: 10,
	},
	comment: {
		padding: 10,
		backgroundColor: "#F9F9F9",
		borderRadius: 10,
		marginBottom: 10,
	},
	commentUsername: {
		fontWeight: "bold",
	},
	commentContent: {
		fontSize: 14,
		marginVertical: 5,
	},
	commentDate: {
		fontSize: 12,
		color: "#777",
	},
	input: {
		borderColor: "#ccc",
		borderWidth: 1,
		borderRadius: 5,
		padding: 10,
		marginTop: 10,
	},
	commentButton: {
		backgroundColor: "#0077B5",
		paddingVertical: 10,
		borderRadius: 5,
		alignItems: "center",
		marginTop: 10,
	},
	commentButtonText: {
		color: "#FFFFFF",
		fontWeight: "bold",
	},
	center: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
});

export default PostDetail;
