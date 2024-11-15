import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	Image,
	TouchableOpacity,
	FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, gql } from "@apollo/client";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Define the query to fetch posts
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
			name
			username
			email
			password
			image
			occupation
			bio
		}
	}
`;

const HomeScreen = ({ navigation }) => {
	const [userId, setUserId] = useState(null);

	// Fetch userId from AsyncStorage and set the userId
	const fetchUserData = async () => {
		try {
			const userData = await AsyncStorage.getItem("userData");
			if (userData) {
				const parsedUserData = JSON.parse(userData);
				console.log("Fetched userData:", parsedUserData); // Log the user data
				setUserId(parsedUserData._id); // Set userId from the user data
			}
		} catch (error) {
			console.error("Error fetching user data:", error);
		}
	};

	useEffect(() => {
		fetchUserData(); // Fetch user data when the component mounts
	}, []);

	console.log("Current userId:", userId); // Log the userId to track its value

	// Fetch the user profile if userId is available
	const {
		data: userData,
		loading: userLoading,
		error: userError,
	} = useQuery(GET_USER_PROFILE, {
		variables: { getUserId: userId },
		skip: !userId, // Skip the query until userId is available
	});

	console.log("User Data:", userData); // Log the userData returned from the query

	const {
		data: postsData,
		loading: postsLoading,
		error: postsError,
	} = useQuery(GET_POSTS);

	if (userLoading || postsLoading) return <Text>Loading...</Text>;
	if (userError || postsError) return <Text>Error loading data</Text>;

	const user = userData?.getUser;
	console.log("User object:", user.name);

	return (
		<View style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity onPress={() => navigation.navigate("Home")}>
					<Text style={styles.headerText}>LinkedOn</Text>
				</TouchableOpacity>
				<TouchableOpacity onPress={() => navigation.navigate("Login")}>
					<Text style={styles.logoutButton}>Logout</Text>
				</TouchableOpacity>
			</View>

			{/* Profile */}
			<View style={styles.profileSection}>
				<Image
					source={{ uri: "https://www.w3schools.com/howto/img_avatar.png" }}
					style={styles.profileImage}
				/>
				<Text style={styles.welcomeText}>{user?.name}</Text>
				<Text style={styles.positionText}>Software Developer</Text>
				<TouchableOpacity
					style={styles.editProfileButton}
					onPress={() => navigation.navigate("EditProfile")}>
					<Text style={styles.editProfileText}>Edit Profile</Text>
				</TouchableOpacity>
			</View>

			{/* Feed */}
			<Text style={styles.feedTitle}>Your Feed</Text>
			<FlatList
				data={postsData?.getPosts}
				keyExtractor={(item) => item._id}
				renderItem={({ item }) => (
					<View
						style={[
							styles.post,
							item.imgUrl ? { paddingBottom: 20 } : { paddingBottom: 0 },
						]}>
						<Image
							source={{ uri: "https://www.w3schools.com/howto/img_avatar.png" }}
							style={styles.postProfileImage}
						/>
						<View style={styles.postContent}>
							<View style={styles.postHeader}>
								<Text style={styles.postAuthor}>{item.author.username}</Text>
								<TouchableOpacity style={styles.likeButton}>
									<Ionicons name="thumbs-up-sharp" size={20} color="#0077B5" />
								</TouchableOpacity>
							</View>
							<Text style={styles.postText}>{item.content}</Text>
							{item.imgUrl && (
								<Image
									source={{ uri: item.imgUrl || "" }}
									style={styles.postImage}
								/>
							)}
						</View>
					</View>
				)}
				contentContainerStyle={styles.feedSection}
			/>

			{/* Footer */}
			<View style={styles.footerContainer}>
				<View style={styles.footer}>
					<TouchableOpacity
						style={styles.footerButton}
						onPress={() => navigation.navigate("Profile")}>
						<Ionicons name="person" size={30} color="white" />
						<Text style={styles.footerText}>Profile</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={styles.footerButton}
						onPress={() => navigation.navigate("FollowerList")}>
						<Ionicons name="people" size={30} color="white" />
						<Text style={styles.footerText}>Connect</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={styles.footerButton}
						onPress={() => navigation.navigate("SearchUser")}>
						<Ionicons name="search" size={30} color="white" />
						<Text style={styles.footerText}>Search</Text>
					</TouchableOpacity>
				</View>
				<TouchableOpacity
					style={styles.floatingButton}
					onPress={() => navigation.navigate("CreatePost")}>
					<Ionicons name="add" size={32} color="white" />
				</TouchableOpacity>
			</View>
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
		marginRight: 15,
		marginTop: 10,
	},
	postContent: {
		flex: 1,
	},
	postHeader: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		// marginBottom: 10,
	},
	postAuthor: {
		fontWeight: "bold",
		fontSize: 16,
		color: "#333333",
	},
	likeButton: {
		padding: 5,
	},
	postText: {
		fontSize: 14,
		color: "#555555",
	},
	postImage: {
		width: "100%",
		height: 200,
		marginTop: 10,
		borderRadius: 5,
	},
	footerContainer: {
		position: "relative",
	},
	footer: {
		flexDirection: "row",
		justifyContent: "space-evenly",
		backgroundColor: "#0077B5",
		paddingVertical: 15,
	},
	footerButton: {
		alignItems: "center",
	},
	footerText: {
		color: "#FFFFFF",
		fontSize: 12,
		fontWeight: "bold",
	},
	floatingButton: {
		position: "absolute",
		bottom: 100,
		right: 20,
		backgroundColor: "#0077B5",
		padding: 15,
		borderRadius: 30,
		elevation: 5,
	},
});

export default HomeScreen;
