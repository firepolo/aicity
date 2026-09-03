import { NpcCount } from "@/shared/constants";
import { MessageType } from "@game/shared/network";
import events from "@/services/events";
import WebSocket from "ws";
import { Client } from "@/shared/data";
import database from "@/services/database";

export default {
	generate(client: Client) {
		console.log("Send GenerateNpc to azure function");
		events.send("npc.generate", {
			clientId: client.uuid,
			count: NpcCount
		});
	},

	async generated(socket: WebSocket): Promise<void> {
		database.client.query("SELECT ");

		const buffer = new ArrayBuffer(1 + 16 + NpcCount * 3 * 4);
		const view = new DataView(buffer);
		view.setUint8(0, MessageType.NpcGenerated);
		view.setUint16(1, NpcCount);
		socket.send(buffer);
	}
}