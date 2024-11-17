import { gql, useQuery } from "@apollo/client";
import React, { useState } from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	FlatList,
	StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const SEARCH_USER = gql`
	query SearchUser($query: String!) {
		searchUser(query: $query) {
			_id
			name
			email
			bio
			image
			occupation
			username
		}
	}
`;

const SearchScreen = () => {
	const [searchQuery, setSearchQuery] = useState("");
	const [following, setFollowing] = useState({});
	const [isSearchTriggered, setIsSearchTriggered] = useState(false);
	const navigation = useNavigation();

	const { data, loading, error, refetch } = useQuery(SEARCH_USER, {
		variables: { query: searchQuery },
		enabled: false,
	});

	const handleSearch = () => {
		if (searchQuery.trim() === "") return;
		setIsSearchTriggered(true);
		refetch();
	};

	const handleFollowToggle = (userId) => {
		setFollowing((prevState) => ({
			...prevState,
			[userId]: !prevState[userId],
		}));
	};

	const handleUserClick = (id) => {
		navigation.navigate("Profile", { userId: id });
	};

	const renderItem = ({ item }) => (
		<View style={styles.resultItem}>
			<TouchableOpacity onPress={() => handleUserClick(item._id)}>
				<Text style={styles.userName}>{item.name}</Text>
			</TouchableOpacity>
			<TouchableOpacity
				style={[
					styles.followButton,
					following[item._id]
						? styles.followingButton
						: styles.notFollowingButton,
				]}
				onPress={() => handleFollowToggle(item._id)}>
				<Text style={styles.followButtonText}>
					{following[item._id] ? "Following" : "Follow"}
				</Text>
			</TouchableOpacity>
		</View>
	);

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<TouchableOpacity>
					<Text style={styles.headerText}>Search</Text>
				</TouchableOpacity>
				<TouchableOpacity onPress={() => navigation.goBack()}>
					<Ionicons name="close" size={24} color="#FFFFFF" />
				</TouchableOpacity>
			</View>
			<View style={styles.searchContainer}>
				<TextInput
					style={styles.searchInput}
					placeholder="Search for users..."
					placeholderTextColor="#999"
					value={searchQuery}
					onChangeText={(text) => setSearchQuery(text)}
					onSubmitEditing={handleSearch}
				/>
				<TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
					<Text style={styles.searchButtonText}>Search</Text>
				</TouchableOpacity>
			</View>

			<View style={styles.resultContainer}>
				{loading && <Text>Loading...</Text>}
				{error && <Text>Error: {error.message}</Text>}

				{isSearchTriggered && (
					<FlatList
						data={data ? data.searchUser : []}
						renderItem={renderItem}
						keyExtractor={(item) => item._id}
						ListEmptyComponent={
							<Text style={styles.noResults}>No users found</Text>
						}
					/>
				)}
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#E9E9E9",
		// paddingHorizontal: 15,
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
	searchContainer: {
		flexDirection: "row",
		marginVertical: 15,
		paddingHorizontal: 15,
	},
	searchInput: {
		flex: 1,
		backgroundColor: "#FFFFFF",
		padding: 10,
		borderRadius: 8,
		fontSize: 16,
		color: "#333333",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.2,
		shadowRadius: 5,
		elevation: 3,
	},
	searchButton: {
		backgroundColor: "#0077B5",
		paddingVertical: 10,
		paddingHorizontal: 15,
		borderRadius: 8,
		marginLeft: 10,
		justifyContent: "center",
	},
	searchButtonText: {
		color: "#FFFFFF",
		fontSize: 16,
		fontWeight: "bold",
	},
	resultContainer: {
		padding: 15,
	},
	resultItem: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		backgroundColor: "#FFFFFF",
		padding: 15,
		borderRadius: 8,
		marginVertical: 5,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.2,
		shadowRadius: 5,
		elevation: 3,
	},
	userName: {
		fontSize: 16,
		color: "#333333",
	},
	followButton: {
		paddingVertical: 8,
		paddingHorizontal: 15,
		borderRadius: 5,
	},
	notFollowingButton: {
		backgroundColor: "#0077B5",
	},
	followingButton: {
		backgroundColor: "#888888",
	},
	followButtonText: {
		color: "#FFFFFF",
		fontSize: 14,
		fontWeight: "bold",
	},
	noResults: {
		textAlign: "center",
		marginTop: 20,
		fontSize: 16,
		color: "#777",
	},
});

export default SearchScreen;
