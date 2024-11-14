import { useState } from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	Alert,
} from "react-native";

const LoginScreen = () => {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");

	const handleLogin = () => {
        if (!username || !password) {
            Alert.alert("Error", "Username and password are required");
        } else {
            Alert.alert(`Welcome ${username}`, "You have successfully logged in");
        }
    }

	return (
		<View style={styles.container}>
			
			<Text style={styles.title}>Sign in to LinkedOn</Text>

			<TextInput
				style={styles.input}
				placeholder="Username"
				placeholderTextColor="#B0C4DE"
				keyboardType="username"
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

			<TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
				<Text style={styles.loginButtonText}>Sign In</Text>
			</TouchableOpacity>

			<Text style={styles.footerText}>
				Not a member? <Text style={styles.link}>Join now</Text>
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
