import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	FlatList,
	Image,
	TouchableOpacity,
	ActivityIndicator,
} from "react-native";
import { useQuery, gql } from "@apollo/client";
// import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

// GraphQL Queries
const GET_FOLLOWERS = gql`
	query Followers($userId: ID!) {
		followers(userId: $userId) {
			_id
			followingId
			followerId
		}
	}
`;

const GET_FOLLOWING = gql`
	query Following($userId: ID!) {
		following(userId: $userId) {
			_id
			followerId
			followingId
		}
	}
`;

const GET_USER = gql`
	query User($userId: ID!) {
		getUser(id: $userId) {
			_id
			name
			username
			image
		}
	}
`;

const FollowersFollowingScreen = ({ navigation }) => {
	const [userId, setUserId] = useState(null);
	const [activeTab, setActiveTab] = useState("followers");

	// Query for user details
	const { data: userData, loading: loadingUser } = useQuery(GET_USER, {
		variables: { userId },
		skip: !userId, // Only run query if userId is available
	});

	// Query for followers
	const { data: followersData, loading: loadingFollowers } = useQuery(
		GET_FOLLOWERS,
		{
			variables: { userId },
			skip: !userId,
		}
	);

	// Query for following
	const { data: followingData, loading: loadingFollowing } = useQuery(
		GET_FOLLOWING,
		{
			variables: { userId },
			skip: !userId,
		}
	);

	const fetchUserData = async () => {
		try {
			const storedUserData = await SecureStore.getItemAsync("userData");
			const parsedUserData = storedUserData ? JSON.parse(storedUserData) : null;

			if (parsedUserData && parsedUserData._id) {
				setUserId(parsedUserData._id);
			} else {
				console.error("User data not found in SecureStore.");
			}
		} catch (error) {
			console.error("Error fetching user data from SecureStore.", error);
		}
	};

	useEffect(() => {
		fetchUserData();
	}, []);

	const followers = followersData?.followers || [];
	const following = followingData?.following || [];
	// console.log(followers, following);
	

	const renderUserCard = (item) => {
		const user =
			item.followerId === userId ? item.followingId : item.followerId;

		return (
			<View style={styles.userCard}>
				<Image
					source={{
						uri:
							userData?.getUser?.image ||
							"https://www.w3schools.com/howto/img_avatar.png",
					}}
					style={styles.userImage}
				/>
				<Text style={styles.userName}>{user}</Text>
			</View>
		);
	};

	if (loadingFollowers || loadingFollowing || loadingUser || !userId) {
		return (
			<View style={styles.loader}>
				<ActivityIndicator size="large" color="#0077B5" />
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.headerText}>Followers & Following</Text>
			</View>

			<View style={styles.tabs}>
				<TouchableOpacity
					style={[styles.tab, activeTab === "followers" && styles.activeTab]}
					onPress={() => setActiveTab("followers")}>
					<Text
						style={[
							styles.tabText,
							activeTab === "followers" && styles.activeTabText,
						]}>
						Followers
					</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={[styles.tab, activeTab === "following" && styles.activeTab]}
					onPress={() => setActiveTab("following")}>
					<Text
						style={[
							styles.tabText,
							activeTab === "following" && styles.activeTabText,
						]}>
						Following
					</Text>
				</TouchableOpacity>
			</View>

			<FlatList
				data={activeTab === "followers" ? followers : following}
				keyExtractor={(item) => item._id}
				renderItem={({ item }) => renderUserCard(item)}
				ListEmptyComponent={() => <Text>No {activeTab} found.</Text>}
				contentContainerStyle={styles.listContainer}
			/>
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
		alignItems: "center",
	},
	headerText: {
		fontSize: 20,
		color: "#FFFFFF",
		fontWeight: "bold",
	},
	tabs: {
		flexDirection: "row",
		justifyContent: "space-around",
		backgroundColor: "#F5F5F5",
		paddingVertical: 10,
	},
	tab: {
		paddingVertical: 10,
		paddingHorizontal: 20,
		borderRadius: 5,
	},
	activeTab: {
		backgroundColor: "#0077B5",
	},
	tabText: {
		fontSize: 16,
		color: "#0077B5",
	},
	activeTabText: {
		color: "#FFFFFF",
	},
	listContainer: {
		padding: 10,
	},
	userCard: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#FFFFFF",
		padding: 15,
		borderRadius: 10,
		marginBottom: 10,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.2,
		shadowRadius: 5,
		elevation: 3,
	},
	userImage: {
		width: 50,
		height: 50,
		borderRadius: 25,
		marginRight: 15,
	},
	userName: {
		fontSize: 16,
		fontWeight: "bold",
		color: "#333333",
	},
	loader: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
});

export default FollowersFollowingScreen;
