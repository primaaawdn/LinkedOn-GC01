import React, { useState, useEffect } from "react";
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

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
			}
		}
	}
`;
const GET_USER_PROFILE = gql`
	query GetUser($getUserId: ID!) {
		getUser(id: $getUserId) {
			_id
			username
			name
			bio
			email
			occupation
			image
		}
	}
`;
const HomeScreen = ({ navigation }) => {
	const [userId, setUserId] = useState(null);

	useEffect(() => {
		const fetchUserId = async () => {
			try {
				const storedUserData = await SecureStore.getItemAsync("userData");
				const parsedUserData = storedUserData
					? JSON.parse(storedUserData)
					: null;
	
				if (parsedUserData && parsedUserData._id) {
					setUserId(parsedUserData._id);
				} else {
					console.error("User data not found in AsyncStorage");
				}
			} catch (error) {
				console.error("Error fetching user data from AsyncStorage:", error);
			}
		};
	
		fetchUserId();
	}, []);
	
	console.log("User ID dari home:", userId);
	

	const {
		data: userData,
		loading: userLoading,
		error: userError,
	} = useQuery(GET_USER_PROFILE, {
		variables: { getUserId: userId },
		skip: !userId,
	});

	const {
		data: postsData,
		loading: postsLoading,
		error: postsError,
	} = useQuery(GET_POSTS);

	if (userLoading || postsLoading) return <Text>Loading...</Text>;
	if (userError || postsError) {
		console.error("User Error:", userError?.message);
		console.error("Posts Error:", postsError?.message);
		return <Text>Error loading data</Text>;
	}

	const user = userData.getUser;
	// console.log(user);

	const posts = postsData.getPosts;
	// console.log(posts);
	// const userPostId = map(posts, (post) => post.author._id);

	const handleProfileClick = async (userId) => {
		await SecureStore.setItemAsync("loggedInUser", userId);

		const storedUserId = await SecureStore.getItemAsync("loggedInUser");
		console.log("ID yang disimpan di AsyncStorage:", storedUserId);

		navigation.navigate("Profile");
	};

	const handleUserClick = async (post) => {
		console.log("Post yang dipilih:", post);
		const authorId = post.author._id;
		console.log("ID author yang dipilih:", authorId);

		await SecureStore.setItemAsync("viewedUserId", authorId);

		const storedUserId = await SecureStore.getItemAsync("viewedUserId");
		console.log("ID yang disimpan di AsyncStorage:", storedUserId);

		navigation.navigate("Profile", { authorId });
	};

	const handlePostClick = async (postId) => {
		console.log("Post yang dipilih:", postId);
		try {
			await SecureStore.setItemAsync("viewedPostId", postId);
			const storedPostId = await SecureStore.getItemAsync("viewedPostId");
			console.log("ID yang disimpan di AsyncStorage:", storedPostId);

			navigation.navigate("PostDetail", { postId });
		} catch (error) {
			console.error("Error saat menyimpan post ID:", error);
		}
	};

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

	const handleLogout = async () => {
		try {
			await SecureStore.deleteItemAsync("userData");
			await SecureStore.deleteItemAsync("viewedPostId");
			// await AsyncStorage.multiRemove(["userData", "viewedPostId"]);
			navigation.replace("Login");
		} catch (error) {
			console.error("Error during logout:", error);
		}
	};

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<TouchableOpacity onPress={() => navigation.navigate("Home")}>
					<Text style={styles.headerText}>LinkedOn</Text>
				</TouchableOpacity>
				<TouchableOpacity onPress={handleLogout}>
					<Text style={styles.logoutButton}>Logout</Text>
				</TouchableOpacity>
			</View>

			<View style={styles.profileSection}>
				<Image
					source={{
						uri: "https://www.w3schools.com/howto/img_avatar.png",
					}}
					style={styles.profileImage}
				/>
				<Text style={styles.welcomeText}>{user?.name}</Text>
				<Text style={styles.positionText}>
					{user?.occupation || "Software Developer"}
				</Text>
				<TouchableOpacity
					style={styles.editProfileButton}
					onPress={() => navigation.navigate("EditProfile")}>
					<Text style={styles.editProfileText}>Edit Profile</Text>
				</TouchableOpacity>
			</View>

			<Text style={styles.feedTitle}>Your Feed</Text>
			<FlatList
				data={posts}
				keyExtractor={(item) => item._id}
				renderItem={({ item }) => (
					<TouchableOpacity onPress={() => handlePostClick(item._id)}>
						<View
							style={[
								styles.post,
								item.imgUrl ? { paddingBottom: 20 } : { paddingBottom: 0 },
							]}>
							<Image
								source={{
									uri:
										user?.image ||
										"https://www.w3schools.com/howto/img_avatar.png",
								}}
								style={styles.postProfileImage}
								// onPress={() => handleUserClick(item)}
							/>
							<View style={styles.postContent}>
								<View style={styles.postHeader}>
									<TouchableOpacity style={styles.button}>
										<Text
											style={styles.postAuthor}
											onPress={() => handleUserClick(item)}>
											{item.author.username}
										</Text>
									</TouchableOpacity>
								</View>
								<Text style={styles.postText}>{item.content}</Text>
								{item.imgUrl && (
									<Image
										source={{ uri: item?.imgUrl || "" }}
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
				onPress={() => navigation.navigate("CreatePost")}>
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
	feedSection: {
		paddingHorizontal: 15,
	},
	feedTitle: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#333333",
		marginVertical: 10,
		paddingLeft: 15,
	},
	post: {
		flexDirection: "row",
		backgroundColor: "#FFFFFF",
		padding: 15,
		marginBottom: 10,
		borderRadius: 10,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.2,
		shadowRadius: 5,
		elevation: 3,
		alignItems: "flex-start",
	},
	postProfileImage: {
		width: 40,
		height: 40,
		borderRadius: 20,
		marginRight: 10,
	},
	postContent: {
		flex: 1,
		marginLeft: 2,
	},
	postHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	postAuthor: {
		fontSize: 16,
		fontWeight: "bold",
		color: "#333333",
	},
	postText: {
		fontSize: 14,
		color: "#555555",
		marginTop: 5,
	},
	postImage: {
		width: 250,
		height: 200,
		marginTop: 10,
		borderRadius: 10,
	},
	floatingButton: {
		position: "absolute",
		bottom: 20,
		right: 20,
		backgroundColor: "#0077B5",
		borderRadius: 50,
		padding: 15,
	},
});

export default HomeScreen;
