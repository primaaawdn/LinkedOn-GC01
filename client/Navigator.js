import React, { useContext } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import HomeScreen from "./screens/HomeScreen";
import ProfileScreen from "./screens/ProfileScreen";
import FollowerScreen from "./screens/FollowerScreen";
import SearchScreen from "./screens/SearchScreen";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import CreatePost from "./screens/CreatePost";
import PostDetail from "./screens/PostDetail";
import AuthContext from "./context/auth";
import { SafeAreaProvider } from "react-native-safe-area-context";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MyTabs() {
	return (
		<Tab.Navigator
			screenOptions={{
				tabBarStyle: styles.footer,
				tabBarLabelStyle: styles.footerText,
				tabBarItemStyle: styles.footerButton,
				tabBarActiveTintColor: "#fff",
				tabBarInactiveTintColor: "#B0B0B0",
			}}>
			<Tab.Screen
				name="Home"
				component={HomeScreen}
				options={{
					tabBarIcon: ({ color }) => (
						<Ionicons name="home" color={color} size={24} />
					),
					headerShown: false,
				}}
			/>
			<Tab.Screen
				name="Profile"
				component={ProfileScreen}
				options={{
					tabBarIcon: ({ color }) => (
						<Ionicons name="person" color={color} size={24} />
					),
					headerShown: false,
				}}
			/>
			<Tab.Screen
				name="Connect"
				component={FollowerScreen}
				options={{
					tabBarIcon: ({ color }) => (
						<Ionicons name="people" color={color} size={24} />
					),
					headerShown: false,
				}}
			/>
			<Tab.Screen
				name="Search"
				component={SearchScreen}
				options={{
					tabBarIcon: ({ color }) => (
						<Ionicons name="search" color={color} size={24} />
					),
					headerShown: false,
				}}
			/>
		</Tab.Navigator>
	);
}

export default function Navigator() {
	const { isSignedIn } = useContext(AuthContext);
	console.log(isSignedIn, "navigator");

	return (
			<NavigationContainer style={styles.container}>
				<Stack.Navigator>
					{isSignedIn ? (
						<>
							<Stack.Screen
								name="Main"
								component={MyTabs}
								options={{ headerShown: false }}
							/>
							<Stack.Screen
								name="CreatePost"
								component={CreatePost}
								options={{ headerShown: false }}
							/>
							<Stack.Screen
								name="PostDetail"
								component={PostDetail}
								options={{ headerShown: false }}
							/>
						</>
					) : (
						<>
							<Stack.Screen
								name="Login"
								component={LoginScreen}
								options={{ headerShown: false }}
							/>
							<Stack.Screen
								name="Register"
								component={RegisterScreen}
								options={{ headerShown: false }}
							/>
						</>
					)}
				</Stack.Navigator>
			</NavigationContainer>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
		marginTop: 15,
	},
	footer: {
		backgroundColor: "#0077B5",
		paddingVertical: 20,
		borderTopWidth: 1,
		borderTopColor: "#B0B0B0",
		paddingBottom: 10,
		marginBottom: 0,
		height: 70,
	},
	footerButton: {
		justifyContent: "center",
		alignItems: "center",
		marginTop: 5,
	},
	footerText: {
		color: "#fff",
		fontSize: 12,
		marginTop: 5,
	},
});
