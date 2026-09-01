import { app, InvocationContext, output } from "@azure/functions";
import type { ServiceBusMessage } from "@azure/service-bus";
import { faker } from "@faker-js/faker";
import { randomUUID } from "crypto";

const busOutput = output.serviceBusTopic({
	connection: process.env.SERVICE_BUS_CONNECTION!,
	topicName: process.env.SERVICE_BUS_TOPIC!
});

export async function generateNpc(message: ServiceBusMessage, context: InvocationContext): Promise<void> {
    console.log('Service bus topic function process message:', message);
	if (!message.applicationProperties || !message.applicationProperties.clientId || !message.applicationProperties.type) return;

	const args = message.applicationProperties!;
	const count = message.body.count;

	for (let i = 0; i < count; ++i) {
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

    console.log('Service bus topic function processed message:', message);
}

app.serviceBusTopic("generateNpc", {
	connection: process.env.SERVICE_BUS_CONNECTION!,
	topicName: process.env.SERVICE_BUS_TOPIC!,
	subscriptionName: "npc.generator",
	extraOutputs: [busOutput],
	handler: generateNpc,
	cardinality: "one"
});