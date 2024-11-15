import { ApolloClient, InMemoryCache } from "@apollo/client";

const client = new ApolloClient({
	uri: "https://8319-104-28-245-130.ngrok-free.app",
	cache: new InMemoryCache(),
});

export default client;