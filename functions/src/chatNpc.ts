import { app, InvocationContext } from "@azure/functions";
import { ServiceBusClient } from "@azure/service-bus";
import { randomUUID, UUID } from "node:crypto";
import { Pool } from "pg";
import { MessageType } from "@game/shared/network";

type EventMessage = {
	clientId: UUID,
	npc: number
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

export async function chatNpc(message: EventMessage, context: InvocationContext): Promise<void> {
	const client = await pool.connect();

	//await client.query("tet $1", []);

    context.log("CHATNPC process message");

	/*try {
		await client.query("BEGIN");

		await client.query("COMMIT");
	}
	catch (e) {
		client.query("ROLLBACK");
    	context.error("CHATNPC error:", e);
	}
	finally {
		client.release();
	}*/

	sender.sendMessages({
		messageId: randomUUID(),
		contentType: "application/json",
		subject: "game.event",
		body: {
			clientId: message.clientId,
			type: MessageType.NpcSay
		}
	});

    context.log("CHATNPC processed message:", message);
}

app.serviceBusTopic("chatNpc", {
	connection: process.env.SERVICE_BUS_CONNECTION!,
	topicName: process.env.SERVICE_BUS_TOPIC!,
	subscriptionName: "npc.chat",
	handler: chatNpc,
	cardinality: "one"
});