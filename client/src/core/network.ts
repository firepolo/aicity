import { MessageType } from "@game/shared/network";

export type MessageCallback = (data: DataView) => void;

const map: { [K in MessageType]?: Set<MessageCallback> } = {};

let socket!: WebSocket;

function onClose(_: CloseEvent): void {
}

function onError(_: Event): void {
}

async function onMessage(e: MessageEvent): Promise<void> {
	const data = new DataView(await (e.data as Blob).arrayBuffer());
	const type = data.getUint8(0);
	if (type >= MessageType.Count) return;

	const set = map[type as MessageType];
	if (!set) return;
	for (const callback of set) callback(data);
}

export default {
	initialize: async (): Promise<void> => new Promise<void>(res => {
		socket = new WebSocket("ws://127.0.0.1:4000");
		socket.addEventListener("open", () => res());
		socket.addEventListener("close", onClose);
		socket.addEventListener("error", onError);
		socket.addEventListener("message", onMessage);
	}),

	send(buffer: ArrayBuffer) {
		socket.send(buffer);
	},

	off(type: MessageType, callback: MessageCallback): void {
		const set = map[type];
		if (!set) return;

		set.delete(callback);
		if (set.size == 0) delete map[type];
	},

	on(type: MessageType, callback: MessageCallback): void {
		map[type] ||= new Set<MessageCallback>();
		map[type].add(callback);
	},

	once(type: MessageType, callback: MessageCallback): void {
		this.on(type, (data: DataView) => {
			this.off(type, callback);
			callback(data);
		});
	}
}