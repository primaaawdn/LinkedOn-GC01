import React, { useContext, useState } from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	Alert,
} from "react-native";
import { useMutation, gql } from "@apollo/client";
// import AsyncStorage from "@react-native-async-storage/async-storage";
import AuthContext from "../context/auth";
import * as SecureStore from "expo-secure-store";

const userLogin = gql`
	mutation LoginUser($username: String!, $password: String!) {
		loginUser(username: $username, password: $password) {
			user {
				_id
				name
				username
				email
				password
			}
			token
		}
	}
`;

const LoginScreen = ({ navigation }) => {
	const [username, setUsername] = useState("akakaka");
	const [password, setPassword] = useState("123456");
	const {isSignedIn, setIsSignedIn} = useContext(AuthContext);

	const [loginUser, { data, loading, error }] = useMutation(userLogin, {
		onCompleted: async (response) => {
			console.log("Response:", response);
			const token = response?.loginUser?.token;
			const user = response?.loginUser?.user;

			if (token && user) {
				try {
					// Save token and user data to AsyncStorage
					await SecureStore.setItemAsync("token", token);
					await SecureStore.setItemAsync("userData", JSON.stringify(user));

					// Log to verify
					console.log("Token:", token);
					// console.log("User:", user);

					setIsSignedIn(true);
					console.log("isSignedIn Login:", isSignedIn);
					Alert.alert("Success", "You have successfully logged in.");
					// navigation.navigate("Main");
				} catch (error) {
					// console.log("AsyncStorage Error:", error);
					Alert.alert("Error", "Failed to save data. Please try again.");
				}
			} else {
				Alert.alert(
					"Error",
					"Failed to get token or user data. Please try again."
				);
			}
		},
	});

	const handleLogin = () => {
		if (!username || !password) {
			Alert.alert("Error", "Username and password are required.");
			return;
		}
		loginUser({ variables: { username, password } });
		setIsSignedIn(true);
	};

	if (error) {
		console.log("GraphQL Error:", error); // Log the error to understand what's going wrong
		Alert.alert("Login Failed", error.message || "An error occurred.");
	}

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Sign in to LinkedOn</Text>

			<TextInput
				style={styles.input}
				placeholder="Username"
				placeholderTextColor="#B0C4DE"
				keyboardType="default"
				value={username}
				onChangeText={setUsername}
			/>

			<TextInput
				style={styles.input}
				placeholder="Password"
				placeholderTextColor="#B0C4DE"
				secureTextEntry
				value={password}
				onChangeText={setPassword}
			/>

			<TouchableOpacity
				style={styles.loginButton}
				onPress={handleLogin}
				disabled={loading}>
				<Text style={styles.loginButtonText}>
					{loading ? "Logging in..." : "Sign In"}
				</Text>
			</TouchableOpacity>

			<Text style={styles.footerText}>
				Not a member?{" "}
				<Text
					style={styles.link}
					onPress={() => navigation.replace("Register")}>
					Join now
				</Text>
			</Text>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#0077B5",
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 25,
	},
	title: {
		fontSize: 30,
		fontWeight: "bold",
		color: "#FFFFFF",
		marginBottom: 30,
	},
	input: {
		width: "100%",
		backgroundColor: "#FFFFFF",
		borderRadius: 5,
		padding: 15,
		fontSize: 16,
		marginBottom: 20,
	},
	loginButton: {
		width: "100%",
		backgroundColor: "#005682",
		paddingVertical: 15,
		borderRadius: 5,
		alignItems: "center",
		marginBottom: 20,
	},
	loginButtonText: {
		color: "#FFFFFF",
		fontSize: 16,
		fontWeight: "bold",
	},
	footerText: {
		color: "#FFFFFF",
		fontSize: 14,
		marginTop: 10,
	},
	link: {
		color: "#B0C4DE",
		fontWeight: "bold",
	},
});

export default LoginScreen;
