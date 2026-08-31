import events from "@/services/events";
import type { Client } from "@/shared/data";

export default {
	async generate(client: Client): Promise<void> {
		events.send(client, [{
			subscription: "npc.generate",
			body: {
				count: 3
			}
		}]);
	}
};