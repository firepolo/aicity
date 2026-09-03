import { ProgressCallback } from "@/core/loader"
import network from "./network"
import { MessageType } from "@game/shared/network"

export default {
	load: async (callback: ProgressCallback): Promise<void> => new Promise((res) => {
		network.once(MessageType.NpcGenerated, (data?: DataView) => {
			res();
		});

		const buffer = new ArrayBuffer(1);
		const view = new DataView(buffer);
		view.setUint8(0, MessageType.GenerateNpc);

		callback("Loading level");
		network.send(buffer);
	})
}