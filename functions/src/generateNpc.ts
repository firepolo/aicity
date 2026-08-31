import { app, InvocationContext, output } from "@azure/functions";
import type { ServiceBusMessage } from "@azure/service-bus";
import { faker } from "@faker-js/faker";
import { randomUUID } from "crypto";

export async function generateNpc(message: unknown, context: InvocationContext): Promise<void> {
    context.log('Service bus topic function processed message:', message);
}

for (let i = 0; i < 3; ++i) {
	console.log({
		firstname: faker.person.firstName(),
		lastname: faker.person.lastName(),
		sex: faker.person.sex(),
		age: faker.number.int({ min: 20, max: 70 }),
		job: faker.person.jobTitle(),
		zodiac: faker.person.zodiacSign(),
		haircolor: faker.color.human(),
		eyecolor: faker.color.human()
	});
}

const busOutput = output.serviceBusTopic({
	connection: process.env.SERVICE_BUS_CONNECTION!,
	topicName: process.env.SERVICE_BUS_TOPIC!
});

app.serviceBusTopic("generateNpc", {
	connection: process.env.SERVICE_BUS_CONNECTION!,
	topicName: process.env.SERVICE_BUS_TOPIC!,
	subscriptionName: "npc.generator",
	extraOutputs: [busOutput],
	handler(message: ServiceBusMessage, context: InvocationContext) {
		if (!message.applicationProperties || !message.applicationProperties.clientId || !message.applicationProperties.type) return;

		const args = message.applicationProperties!;

		context.extraOutputs.set(busOutput, JSON.stringify({
			messageId: randomUUID(),
			contentType: "application/json",
			subject: "game.event",
			applicationProperties: {
				clientId: args.clientId,
				type: "npc.generated"
			},
			body: message.body
		}));
	},
	cardinality: "one"
});