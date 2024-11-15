const http = require("http");
const ngrok = require("@ngrok/ngrok");

const port = 3000;
ngrok
	.connect({ addr: port, authtoken: process.env.NGROK_AUTHTOKEN })
	.then((listener) => {
		console.log(`Ingress established at: ${listener.url()}`);
	})
	.catch((err) => {
		console.error("Error connecting to ngrok:", err);
	});
