import { useState } from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	Alert,
} from "react-native";

const RegisterScreen = ({ navigation }) => {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const handleRegister = () => {
		if (name && email && password) {
			Alert.alert("Registration Successful");
			navigation.navigate("Login");
		} else {
			Alert.alert("Registration Failed", "Please fill in all fields");
		}
	};

	return (
		<View style={styles.container}>
			
			<Text style={styles.title}>Join LinkedOn</Text>

			<TextInput
				style={styles.input}
				placeholder="Name"
				placeholderTextColor="#B0C4DE"
				value={name}
				onChangeText={setName}
			/>

			<TextInput
				style={styles.input}
				placeholder="Email"
				placeholderTextColor="#B0C4DE"
				keyboardType="email-address"
				value={email}
				onChangeText={setEmail}
			/>

			<TextInput
				style={styles.input}
				placeholder="Password"
				placeholderTextColor="#B0C4DE"
				secureTextEntry
				value={password}
				onChangeText={setPassword}
			/>

			<TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
				<Text style={styles.registerButtonText}>Sign Up</Text>
			</TouchableOpacity>

			<Text style={styles.footerText}>
				Already a member?
				<Text style={styles.link} onPress={() => navigation.navigate("Login")}>
					{" "}
					Sign in
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
		paddingHorizontal: 20,
	},
	logo: {
		width: 150,
		height: 50,
		marginBottom: 20,
	},
	title: {
		fontSize: 24,
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
	registerButton: {
		width: "100%",
		backgroundColor: "#005682",
		paddingVertical: 15,
		borderRadius: 5,
		alignItems: "center",
		marginBottom: 20,
	},
	registerButtonText: {
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

export default RegisterScreen;
