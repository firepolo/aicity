import events, { EventMessage } from "@/services/events";
import type { Client } from "@/shared/data";
import { faker } from "@faker-js/faker";

export default {
	async generate(client: Client): Promise<void> {
		const messages: EventMessage[] = [{
			subscription: "level.generate"
		}];

		for (let i = 0; i < 3; ++i) {
			messages.push({
				subscription: "npc.generate",
				body: {
					firstname: faker.person.firstName(),
					lastname: faker.person.lastName(),
					sex: faker.person.sex(),
					job: faker.person.jobTitle(),
					zodiac: faker.person.zodiacSign()
				}
			});
		}

		events.send(client, messages);
	}
};