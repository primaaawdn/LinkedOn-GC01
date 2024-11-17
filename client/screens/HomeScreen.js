import React, { useState, useEffect, useContext } from "react";
import {
	View,
	Text,
	StyleSheet,
	Image,
	TouchableOpacity,
	FlatList,
	ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, gql } from "@apollo/client";
import * as SecureStore from "expo-secure-store";
import AuthContext from "../context/auth";

const GET_POSTS = gql`
	query GetPosts {
		getPosts {
			_id
			content
			tags
			imgUrl
			comments {
				content
				username
			}
			likes {
				username
			}
			createdAt
			author {
				_id
				username
				name
			}
		}
	}
`;

const GET_USER_PROFILE = gql`
	query GetUser($getUserId: ID!) {
		getUser(id: $getUserId) {
			_id
			name
			username
			image
			occupation
		}
	}
`;

const HomeScreen = ({ navigation }) => {
	const [userId, setUserId] = useState(null);
	const { logout } = useContext(AuthContext);

	useEffect(() => {
		const fetchUserId = async () => {
			try {
				const storedUserData = await SecureStore.getItemAsync("userData");
				const parsedUserData = storedUserData
					? JSON.parse(storedUserData)
					: null;

				if (parsedUserData && parsedUserData._id) {
					setUserId(parsedUserData._id);
				}
			} catch (error) {
				console.error("Error fetching user data:", error);
			}
		};
		fetchUserId();
	}, []);

	const {
		data: userData,
		loading: userLoading,
		error: userError,
		refetch: refetchUser,
	} = useQuery(GET_USER_PROFILE, {
		variables: { getUserId: userId },
		skip: !userId,
	});

	const {
		data: postsData,
		loading: postsLoading,
		error: postsError,
		refetch: refetchPosts,
	} = useQuery(GET_POSTS);

	if (userError || postsError) {
		console.error("User Error:", userError?.message);
		console.error("Posts Error:", postsError?.message);
		return (
			<View style={styles.center}>
				<Text>Error loading data. Please try again later.</Text>
			</View>
		);
	}

	if (userLoading || postsLoading || !userId) {
		return (
			<View style={styles.center}>
				<ActivityIndicator size="large" color="#0077B5" />
			</View>
		);
	}

	const user = userData?.getUser;
	const posts = postsData?.getPosts;

	const formatDate = (isoString) => {
		const date = new Date(isoString);
		return date.toLocaleDateString("en-US", {
			day: "2-digit",
			month: "short",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const handleProfileClick = () => navigation.navigate("Profile");

	const handlePostClick = async (postId) => {
		try {
			await SecureStore.setItemAsync("viewedPostId", postId);
			navigation.navigate("PostDetail", { postId });
			refetchPosts();
		} catch (error) {
			console.error("Error saving post ID:", error);
		}
	};

	const handleLogout = async () => {
		await logout();
		refetchUser();
		navigation.replace("Login");
	};

	const handleCreatePost = () => {
		navigation.navigate("CreatePost");
		refetchPosts();
	};

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.headerText}>LinkedOn</Text>
				<TouchableOpacity onPress={handleLogout}>
					<Text style={styles.logoutButton}>Logout</Text>
				</TouchableOpacity>
			</View>

			<View style={styles.profileSection}>
				<Image
					source={{
						uri:
							user?.image || "https://www.w3schools.com/howto/img_avatar.png",
					}}
					style={styles.profileImage}
				/>
				<Text style={styles.welcomeText}>{user?.name}</Text>
				<Text style={styles.positionText}>
					{user?.occupation || "Software Developer"}
				</Text>
				<TouchableOpacity
					style={styles.editProfileButton}
					onPress={handleProfileClick}>
					<Text style={styles.editProfileText}>Edit Profile</Text>
				</TouchableOpacity>
			</View>

			<Text style={styles.feedTitle}>Your Feed</Text>
			<FlatList
				data={posts}
				keyExtractor={(item) => item._id}
				renderItem={({ item }) => (
					<TouchableOpacity onPress={() => handlePostClick(item._id)}>
						<View style={styles.post}>
							<Image
								source={{
									uri:
										item.author?.image ||
										"https://www.w3schools.com/howto/img_avatar.png",
								}}
								style={styles.postProfileImage}
							/>
							<View style={styles.postContent}>
								<Text style={styles.postAuthor}>{item.author.name}</Text>
								<Text style={styles.postText}>{item.content}</Text>
								{item.imgUrl && (
									<Image
										source={{ uri: item.imgUrl }}
										style={styles.postImage}
									/>
								)}
								<Text style={styles.postText}>
									{formatDate(item.createdAt)}
								</Text>
							</View>
						</View>
					</TouchableOpacity>
				)}
				contentContainerStyle={styles.feedSection}
			/>

			<TouchableOpacity
				style={styles.floatingButton}
				onPress={handleCreatePost}>
				<Ionicons name="add" size={32} color="white" />
			</TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#E9E9E9",
	},
	header: {
		backgroundColor: "#0077B5",
		padding: 15,
		paddingVertical: 20,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginTop: 25,
	},
	headerText: {
		fontSize: 20,
		color: "#FFFFFF",
		fontWeight: "bold",
	},
	logoutButton: {
		color: "#FFFFFF",
		fontSize: 16,
	},
	profileSection: {
		alignItems: "center",
		backgroundColor: "#FFFFFF",
		padding: 20,
		marginVertical: 15,
		marginHorizontal: 15,
		borderRadius: 10,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 5,
		elevation: 4,
	},
	profileImage: {
		width: 80,
		height: 80,
		borderRadius: 40,
		marginBottom: 10,
	},
	welcomeText: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#333333",
	},
	positionText: {
		fontSize: 16,
		color: "#777777",
	},
	editProfileButton: {
		backgroundColor: "#0077B5",
		paddingVertical: 6,
		paddingHorizontal: 20,
		borderRadius: 20,
		marginTop: 10,
	},
	editProfileText: {
		color: "#fff",
		fontSize: 14,
		fontWeight: "bold",
	},
	feedTitle: {
		fontSize: 22,
		fontWeight: "bold",
		marginLeft: 15,
		marginTop: 20,
		marginBottom: 10,
	},
	feedSection: {
		paddingBottom: 20,
	},
	post: {
		backgroundColor: "#fff",
		marginBottom: 15,
		padding: 15,
		flexDirection: "row",
		borderRadius: 10,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 5,
		elevation: 4,
		marginHorizontal: 15,
	},
	postProfileImage: {
		width: 50,
		height: 50,
		borderRadius: 25,
		marginRight: 10,
	},
	postContent: {
		flex: 1,
	},
	postAuthor: {
		fontWeight: "bold",
		fontSize: 16,
	},
	postText: {
		fontSize: 14,
		color: "#555555",
		marginTop: 5,
	},
	postImage: {
		width: "100%",
		height: 200,
		marginTop: 10,
		borderRadius: 8,
	},
	floatingButton: {
		position: "absolute",
		bottom: 20,
		right: 20,
		backgroundColor: "#0077B5",
		padding: 15,
		borderRadius: 50,
		elevation: 4,
	},
});

export default HomeScreen;
