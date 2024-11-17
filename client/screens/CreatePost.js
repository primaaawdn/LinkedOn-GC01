import React, { useEffect, useState } from "react";
import {
	View,
	TextInput,
	Button,
	StyleSheet,
	Alert,
	ActivityIndicator,
	Text,
} from "react-native";
import { gql, useMutation } from "@apollo/client";
import * as SecureStore from "expo-secure-store";

const ADD_POST = gql`
	mutation AddPost($content: String!, $tags: [String], $imgUrl: String) {
		addPost(content: $content, tags: $tags, imgUrl: $imgUrl)
	}
`;

const CreatePost = ({ navigation }) => {
	const [content, setContent] = useState("");
	const [tags, setTags] = useState("");
	const [imgUrl, setImgUrl] = useState("");
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
					console.error("User data not found in SecureStore");
				}
			} catch (error) {
				console.error("Error fetching user data from SecureStore:", error);
			}
		};

		fetchUserId();
	}, []);

	const [addPost, { loading, error }] = useMutation(ADD_POST, {
		refetchQueries: ["GetPosts"],
		onCompleted: () => {
			Alert.alert("Success", "Post created successfully!");
			navigation.goBack();
		},
		onError: (err) => {
			console.error(err.message);
			Alert.alert("Error", err.message);
		},
	});

	const handleCreatePost = () => {
		if (!content) {
			Alert.alert("Error", "Content is required!");
			return;
		}

		if (!userId) {
			Alert.alert("Error", "You must be logged in to create a post.");
			return;
		}

		addPost({
			variables: {
				content,
				tags: tags.split(",").map((tag) => tag.trim()),
				imgUrl: imgUrl || null, 
				authorId: userId,
			},
		});
	};

	return (
		<View style={styles.container}>
			<Text style={styles.label}>Content</Text>
			<TextInput
				style={styles.input}
				placeholder="Write your post content here"
				value={content}
				onChangeText={setContent}
			/>
			<Text style={styles.label}>Tags (comma-separated)</Text>
			<TextInput
				style={styles.input}
				placeholder="e.g. react, programming"
				value={tags}
				onChangeText={setTags}
			/>
			<Text style={styles.label}>Image URL</Text>
			<TextInput
				style={styles.input}
				placeholder="Enter image URL"
				value={imgUrl}
				onChangeText={setImgUrl}
			/>
			{loading ? (
				<ActivityIndicator size="large" color="#0000ff" />
			) : (
				<Button title="Create Post" onPress={handleCreatePost} />
			)}
			{error && <Text style={styles.errorText}>{error.message}</Text>}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
		backgroundColor: "#fff",
	},
	label: {
		fontWeight: "bold",
		marginBottom: 8,
	},
	input: {
		borderWidth: 1,
		borderColor: "#ccc",
		padding: 10,
		marginBottom: 16,
		borderRadius: 4,
	},
	errorText: {
		color: "red",
		marginTop: 10,
	},
});

export default CreatePost;
