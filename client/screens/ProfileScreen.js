import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Image, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery, gql } from "@apollo/client";
import * as SecureStore from "expo-secure-store";

const GET_USER_PROFILE = gql`
	query GetUserProfile($id: ID!) {
		user(id: $id) {
			_id
			name
			username
			email
			bio
			image
		}
	}
`;

const ProfileScreen = () => {
	const [userId, setUserId] = useState(null);

	useEffect(() => {
		const fetchUserId = async () => {
			const viewedUserId = await SecureStore.getItemAsync("viewedUserId");
			console.log("Viewed User ID dari SecureStore:", viewedUserId);
			if (viewedUserId) {
				setUserId(viewedUserId);
			} else {
				console.log("Tidak ada ID user yang disimpan di SecureStore.");
			}
		};
		fetchUserId();
	}, []);

	const { data, loading, error } = useQuery(GET_USER_PROFILE, {
		variables: { id: userId },
		skip: !userId,
	});

	if (loading) {
		return (
			<View style={styles.loader}>
				<ActivityIndicator size="large" color="#0000ff" />
			</View>
		);
	}

	if (error) {
		console.log("Error loading profile:", error);
		return (
			<View style={styles.errorContainer}>
				<Text style={styles.errorText}>
					Error loading profile: {error.message}
				</Text>
			</View>
		);
	}

	if (data && data.user) {
		const { name, username, email, bio, image } = data.user;

		return (
			<View style={styles.container}>
				{image ? (
					<Image source={{ uri: image }} style={styles.profileImage} />
				) : (
					<Image
						source={{
							uri: "https://www.w3schools.com/howto/img_avatar.png",
						}}
						style={styles.profileImage}
					/>
				)}
				<Text style={styles.nameText}>{name}</Text>
				<Text style={styles.usernameText}>{username}</Text>
				<Text style={styles.emailText}>{email}</Text>
				<Text style={styles.bioText}>{bio}</Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<Text style={styles.errorText}>No user found</Text>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#F9F9F9",
		padding: 20,
	},
	profileImage: {
		width: 100,
		height: 100,
		borderRadius: 50,
		marginBottom: 20,
	},
	nameText: {
		fontSize: 24,
		fontWeight: "bold",
		color: "#333",
	},
	usernameText: {
		fontSize: 18,
		color: "#666",
		marginBottom: 10,
	},
	emailText: {
		fontSize: 16,
		color: "#0077B5",
		marginBottom: 10,
	},
	bioText: {
		fontSize: 14,
		color: "#444",
		fontStyle: "italic",
		textAlign: "center",
	},
	loader: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#F9F9F9",
	},
	errorContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	errorText: {
		fontSize: 16,
		color: "red",
	},
});

export default ProfileScreen;
