import { ProgressCallback } from "@/core/loader";
import network from "./network";
import { MessageType } from "@game/shared/network";
import { colors } from "@game/shared/colors";
import { Npc } from "@/entities/npc";

const npc: Npc[] = [];

export default {
	load: async (callback: ProgressCallback): Promise<void> => new Promise((res) => {
		network.once(MessageType.NpcGenerated, (data?: DataView) => {
			const view = data!;
			const count = view.getInt16(1);
			const npc: any[] = [];
			for (let i = 0; i < count; ++i) {
				const j = 3 + i * 6;
				npc.push({
					id: view.getUint32(j),
					hair: Object.values(colors.hair)[view.getUint8(j + 4)],
					eye: Object.values(colors.eye)[view.getUint8(j + 5)]
				});
			}

			console.log("Received NPC", npc);
			res();
		});

		const buffer = new ArrayBuffer(1);
		const view = new DataView(buffer);
		view.setUint8(0, MessageType.GenerateNpc);

		callback("Loading level");
		network.send(buffer);
	})
}