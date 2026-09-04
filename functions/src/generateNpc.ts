import { app, InvocationContext } from "@azure/functions";
import { ServiceBusClient } from "@azure/service-bus";
import { faker } from "@faker-js/faker";
import { randomUUID, UUID } from "node:crypto";
import { Pool } from "pg";
import { MessageType } from "@game/shared/network";
import { colors } from "@game/shared/colors";

type EventMessage = {
	clientId: UUID,
	count: number
};

const pool = new Pool({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: process.env.DB_NAME,
	pipeline: true,
	ssl: true
});

const bus = new ServiceBusClient(process.env[process.env.SERVICE_BUS_CONNECTION!]!);

const sender = bus.createSender(process.env.SERVICE_BUS_TOPIC!, {
	identifier: process.env.APP_NAME
});

export async function generateNpc(message: EventMessage, context: InvocationContext): Promise<void> {
	const client = await pool.connect();

    context.log("GENERATENPC process message");

	try {
		await client.query("BEGIN");

		for (let i = 0; i < message.count; ++i) {
			const npc = {
				firstname: faker.person.firstName(),
				lastname: faker.person.lastName(),
				sex: faker.person.sex(),
				age: faker.number.int({ min: 20, max: 70 }),
				job: faker.person.jobTitle(),
				zodiac: faker.person.zodiacSign(),
				haircolor: faker.helpers.objectKey(colors.hair),
				eyecolor: faker.helpers.objectKey(colors.eye)
			};
    		context.log("GENERATENPC insert npc", npc);
			await client.query("INSERT INTO npc(client_id, attributes, description) VALUES($1, $2, $3)", [
				message.clientId,
				JSON.stringify(npc),
				""
			]);
    		context.log("GENERATENPC npc inserted");
		}

		await client.query("COMMIT");
	}
	catch (e) {
		client.query("ROLLBACK");
    	context.error("GENERATENPC error:", e);
	}
	finally {
		client.release();
	}

	sender.sendMessages({
		messageId: randomUUID(),
		contentType: "application/json",
		subject: "game.event",
		body: {
			clientId: message.clientId,
			type: MessageType.NpcGenerated
		}
	});

    context.log("GENERATENPC topic function processed message:", message);
}

app.serviceBusTopic("generateNpc", {
	connection: process.env.SERVICE_BUS_CONNECTION!,
	topicName: process.env.SERVICE_BUS_TOPIC!,
	subscriptionName: "npc.generator",
	handler: generateNpc,
	cardinality: "one"
});