import { StatusBar } from "expo-status-bar";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import { StyleSheet } from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { ApolloProvider } from "@apollo/client";
import LoginScreen from "./screens/LoginScreen";
import HomeScreen from "./screens/HomeScreen";
import RegisterScreen from "./screens/RegisterScreen";
import CreatePost from "./screens/CreatePost";
import SearchScreen from "./screens/SearchScreen";
import PostDetail from "./screens/PostDetail";
import client from "./config/apollo";

const Stack = createStackNavigator();

export default function App() {
	return (
		<ApolloProvider client={client}>
			<SafeAreaProvider>
				<SafeAreaView style={styles.container}>
					<NavigationContainer>
						<StatusBar barStyle="light-content" backgroundColor="#0077B5" />
						<Stack.Navigator initialRouteName="Login">
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
							<Stack.Screen
								name="Home"
								component={HomeScreen}
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
							<Stack.Screen
								name="SearchUser"
								component={SearchScreen}
								options={{ headerShown: false }}
							/>
						</Stack.Navigator>
					</NavigationContainer>
				</SafeAreaView>
			</SafeAreaProvider>
		</ApolloProvider>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
	},
});
