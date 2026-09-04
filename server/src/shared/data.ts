import WebSocket from "ws";
import { UUID } from "node:crypto";

export type Client = {
	uuid: UUID,
	socket: WebSocket
};

export const sockets: Map<UUID, WebSocket> = new Map();