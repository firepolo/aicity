import "dotenv/config";
import WebSocket, { WebSocketServer } from "ws";
import { MessageType } from "@game/shared/network";
import { sockets } from "@/shared/data";
import { randomUUID, UUID } from "crypto";
import type { Client } from "@/shared/data";
import level from "@/handlers/level";

let server!: WebSocketServer;

function onConnection(socket: WebSocket): void {
	const uuid: UUID = randomUUID();
	const client: Client = { uuid, socket };
	sockets.set(uuid, socket);

	const buffer: ArrayBuffer = new ArrayBuffer(1);
	Buffer.from(buffer).writeUInt8(MessageType.LoadLevel);
	socket.send(buffer);

	socket.on("close", (code: number) => {
		console.log(`Client disconnected with code ${code}`);
		sockets.delete(uuid);
	});

	socket.on("error", console.error);

	socket.on("message", (data: WebSocket.RawData) => {
		const buffer = data as Buffer;

		const type = buffer.readUint8(0);

		switch (type) {
			case MessageType.LoadLevel: {
				level.generate(client);
				break;
			}
		}
	});
}

export default {
	run: async () => new Promise<void>((res, rej) => {
		server = new WebSocketServer({
			port: parseInt(process.env.WEBSOCKET_PORT!)
		});
		server.on("connection", onConnection);
		server.once("error", rej);
		server.once("listening", res);
		console.log(`Server listening on port ${process.env.WEBSOCKET_PORT}`);
	}),

	shutdown: async () => new Promise((res) => {
		if (!server) return;

		for (const client of server.clients) client.close();
		server.close(res);
	})
};