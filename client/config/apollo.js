import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from "@apollo/client";
import * as SecureStore from "expo-secure-store";

const httpLink = new HttpLink({
	uri: "https://linkedon.primawidiani.online",
});

const authLink = new ApolloLink(async (operation, forward) => {
	const token = await SecureStore.getItemAsync("token");
	console.log(token, "token");
	
	operation.setContext({
		headers: {
			authorization: token ? `${token}` : "",
		},
	});
	return forward(operation);
})

const client = new ApolloClient({
	link: ApolloLink.from([authLink, httpLink]),
	cache: new InMemoryCache(),
});

export default client;
