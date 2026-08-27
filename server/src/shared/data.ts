import WebSocket from "ws";

export type Client = {
	uid: string,
	socket: WebSocket
};

export const sockets: Map<string, WebSocket> = new Map();