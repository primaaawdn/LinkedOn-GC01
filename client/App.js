import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ApolloProvider } from "@apollo/client";
import { StatusBar } from "expo-status-bar";
import Navigator from "./Navigator";
import client from "./config/apollo";
import { AuthProvider } from "./context/auth";

export default function App() {
	return (
		<AuthProvider>
			<ApolloProvider client={client}>
				<SafeAreaProvider>
					<StatusBar barStyle="light-content" backgroundColor="#0077B5" />
					<Navigator />
				</SafeAreaProvider>
			</ApolloProvider>
		</AuthProvider>
	);
}
