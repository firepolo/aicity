import "dotenv/config";
import WebSocket, { WebSocketServer } from "ws";
import { MessageType } from "@game/shared/network";
import { sockets } from "@/shared/data";
import { randomUUID, UUID } from "crypto";
import type { Client } from "@/shared/data";
import { generateLevel } from "./routers/level";

const server = new WebSocketServer({
	port: 4000
});

server.on("connection", (socket: WebSocket) => {
	const uuid: UUID = randomUUID();
	const client: Client = { uuid, socket };
	sockets.set(uuid, socket);

	const buffer: ArrayBuffer = new ArrayBuffer(1);
	Buffer.from(buffer).writeUInt8(MessageType.LoadLevel);
	socket.send(buffer);

	socket.on("close", (code: number) => {
		console.log(`Client disconnected with code ${code}`);
	});

	socket.on("error", console.error);

	socket.on("message", (data: WebSocket.RawData) => {
		const buffer = data as Buffer;

		const type = buffer.readUint8(0);

		switch (type) {
			case MessageType.LoadLevel: {
				//generateLevel(client);
				break;
			}
		}
	});
});

console.log("Server listening on port 4000");