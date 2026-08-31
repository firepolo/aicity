import { ServiceBusMessage } from "@azure/service-bus";
import { app, InvocationContext, output } from "@azure/functions";
import { faker } from "@faker-js/faker";
import { randomUUID } from "crypto";

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
	connection: process.env.SERVICE_BUS_ENDPOINT!,
	topicName: "game"
});

app.serviceBusTopic("npc.generate", {
	connection: process.env.SERVICE_BUS_ENDPOINT!,
	topicName: "game",
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