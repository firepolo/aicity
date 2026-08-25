let socket: WebSocket;

function onOpen(e: Event): void {
	socket.send("Hello server !!!");
}

function onClose(e: CloseEvent): void {
}

function onError(e: Event): void {
}

function onMessage(e: MessageEvent): void {
	console.log(e.data);
}

export default {
	initialize(): void {
		socket = new WebSocket("ws://127.0.0.1:5000");
		socket.addEventListener("open", onOpen);
		socket.addEventListener("close", onClose);
		socket.addEventListener("error", onError);
		socket.addEventListener("message", onMessage);
	}
}