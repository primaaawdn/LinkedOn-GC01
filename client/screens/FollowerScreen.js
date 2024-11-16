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
import AsyncStorage from "@react-native-async-storage/async-storage";

const GET_FOLLOWERS = gql`
	query Followers($userId: ID!) {
		followers(userId: $userId) {
			_id
			followerName
			followerUsername
			followerImage
		}
	}
`;

const GET_FOLLOWING = gql`
	query Following($userId: ID!) {
		following(userId: $userId) {
			_id
			followingName
			followingUsername
			followingImage
		}
	}
`;

const FollowersFollowingScreen = () => {
	const [userId, setUserId] = useState(null);
	const [activeTab, setActiveTab] = useState("followers");

	const { data: followersData, loading: loadingFollowers } = useQuery(
		GET_FOLLOWERS,
		{ variables: { userId }, skip: !userId }
	);

	const { data: followingData, loading: loadingFollowing } = useQuery(
		GET_FOLLOWING,
		{ variables: { userId }, skip: !userId }
	);

	// console.log("Followers:", followersData);
	// console.log("Following:", followingData);

	const fetchUserId = async () => {
		try {
			const storedUserData = await AsyncStorage.getItem("userData");
			const parsedUserData = storedUserData ? JSON.parse(storedUserData) : null;
			if (parsedUserData && parsedUserData._id) {
				setUserId(parsedUserData._id);
			}
		} catch (error) {
			console.error("Error fetching user data:", error);
		}
	};

	useEffect(() => {
		if (!userId) fetchUserId();
	}, [userId]);

	if (loadingFollowers || loadingFollowing || !userId) {
		return (
			<View style={styles.loader}>
				<ActivityIndicator size="large" color="#0077B5" />
			</View>
		);
	}

	const renderUserCard = ({ item }) => {
		const name =
			activeTab === "followers" ? item.followerName : item.followingName;
		const username =
			activeTab === "followers"
				? item.followerUsername
				: item.followingUsername;
		const image =
			activeTab === "followers" ? item.followerImage : item.followingImage;

		return (
			<View style={styles.userCard}>
				<Image
					source={{
						uri: image || "https://www.w3schools.com/howto/img_avatar.png",
					}}
					style={styles.userImage}
				/>
				<View>
					<Text style={styles.userName}>{name}</Text>
					<Text style={styles.userUsername}>@{username}</Text>
				</View>
			</View>
		);
	};

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
					<Text
						style={[
							styles.tabText,
							activeTab === "followers" && styles.activeTabText,
							{ marginHorizontal: "auto" },
						]}>
						({followersData.followers.length})
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
					<Text
						style={[
							styles.tabText,
							activeTab === "following" && styles.activeTabText,
							{ marginHorizontal: "auto" },
						]}>
						({followingData.following.length})
					</Text>
				</TouchableOpacity>
			</View>

			<FlatList
				data={
					activeTab === "followers"
						? followersData?.followers
						: followingData?.following
				}
				keyExtractor={(item) => item._id}
				renderItem={renderUserCard}
				ListEmptyComponent={() => (
					<Text style={styles.emptyText}>No {activeTab} found.</Text>
				)}
				contentContainerStyle={styles.listContainer}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#F8F8F8",
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
		backgroundColor: "#FFFFFF",
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
	userUsername: {
		fontSize: 14,
		color: "#555555",
	},
	loader: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	emptyText: {
		textAlign: "center",
		marginTop: 20,
		color: "#888888",
		fontSize: 16,
	},
});

export default FollowersFollowingScreen;
