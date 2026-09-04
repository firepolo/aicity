import { MessageType } from "@game/shared/network";
import { indexes } from "@game/shared/colors";
import events from "@/services/events";
import { Client } from "@/shared/data";
import database from "@/services/database";

export default {
	generate(client: Client) {
		events.send("npc.generate", {
			clientId: client.uuid,
			count: 3
		});
	},

	async generated(client: Client): Promise<void> {
		const rows = (await database.client.query(`SELECT id, attributes->>'haircolor' as hair, attributes->>'eyecolor' as eye FROM npc WHERE client_id=$1`, [client.uuid])).rows;
		const buffer = new ArrayBuffer(3 + rows.length * 6);
		const view = new DataView(buffer);
		view.setUint8(0, MessageType.NpcGenerated);
		view.setUint16(1, rows.length);
		for (let i = 0; i < rows.length; ++i) {
			const row = rows[i];
			const j = 3 + i * 6;
			view.setUint32(j, row.id);
			view.setUint8(j + 4, indexes.hair[row.hair]);
			view.setUint8(j + 5, indexes.eye[row.eye]);
		}
		client.socket.send(buffer);
	}
}