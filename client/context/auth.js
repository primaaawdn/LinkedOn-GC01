import React, { createContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";

const AuthContext = createContext({
	isSignedIn: false,
	setIsSignedIn: () => {},
	logout: () => {},
});

export const AuthProvider = ({ children }) => {
	const [isSignedIn, setIsSignedIn] = useState(false);

	useEffect(() => {
		const checkToken = async () => {
			try {
				const token = await SecureStore.getItemAsync("token");
				setIsSignedIn(!!token);
			} catch (error) {
				console.error("Failed to retrieve token:", error);
			}
		};

		checkToken();
	}, []);

	const logout = async () => {
		try {
			await SecureStore.deleteItemAsync("token");
			await SecureStore.deleteItemAsync("userData");
			setIsSignedIn(false);
		} catch (error) {
			console.error("Error during logout:", error);
		}
	};

	return (
		<AuthContext.Provider value={{ isSignedIn, setIsSignedIn, logout }}>
			{children}
		</AuthContext.Provider>
	);
};

export default AuthContext;
