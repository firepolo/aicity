import "dotenv/config";
import websocket from "./services/websocket";
import events from "./services/events";

async function shutdown(code: number): Promise<void> {
	try {
		await websocket.shutdown();
		await events.shutdown();
	}
	catch (_) {}
	process.exitCode = code;
}

async function main(): Promise<void> {
	process.on("SIGINT", () => {
		shutdown(0);
	});

	process.on("SIGTERM", () => {
		shutdown(0);
	});

	process.on("uncaughtException", () => {
		shutdown(1);
	});

	process.on("unhandledRejection", () => {
		shutdown(1);
	});

	events.initialize();
	await websocket.run();
}

main().catch((error) => {
	console.error("Fatal error: ", error);
	shutdown(1);
});