import { ProgressCallback } from "@/core/booter"
import network from "./network"
import { MessageType } from "@game/shared/network"

export default {
	load(callback: ProgressCallback) {
		const buffer = new ArrayBuffer(1);

		const view = new DataView(buffer);
		view.setUint8(0, MessageType.LoadLevel);

		network.send(buffer);
	}
}