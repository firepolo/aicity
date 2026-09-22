import { app, InvocationContext } from "@azure/functions";
import { ServiceBusClient } from "@azure/service-bus";
import { randomUUID, UUID } from "node:crypto";
import { Pool } from "pg";
import { MessageType } from "@game/shared/network";
import OpenAI from "openai";

type EventMessage = {
	clientId: UUID,
	npc: number,
	message: string
};

const pool = new Pool({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: process.env.DB_NAME,
	pipeline: true,
	ssl: true
});

const oai = new OpenAI({
	baseURL: process.env.OPENAI_HOST,
	apiKey: process.env.OPENAI_API_KEY
})

const bus = new ServiceBusClient(process.env[process.env.SERVICE_BUS_CONNECTION!]!);

const sender = bus.createSender(process.env.SERVICE_BUS_TOPIC!, {
	identifier: process.env.APP_NAME
});

export async function chatNpc(message: EventMessage, context: InvocationContext): Promise<void> {
    context.log("CHATNPC process message");

	const embedding = (await oai.embeddings.create({
		model: process.env.OPENAI_MODEL_EMBEDDING!,
		input: message.message,
		encoding_format: "float"
	})).data[0].embedding;

	const pql = await pool.connect();
	const npc = (await pql.query("SELECT id, attributes FROM npcs WHERE id = $1 LIMIT 1", [ message.npc ])).rows[0];
	const extras = (await pql.query("SELECT text FROM informations WHERE npc_id = $1 OR npc_id IS NULL ORDER BY embedding <=> $2 LIMIT 3", [
		message.npc,
		JSON.stringify(embedding)
	])).rows;

	const response = await oai.responses.create({
		model: process.env.OPENAI_MODEL_CHAT!,
		instructions: process.env.OPENAI_SYSTEM_PROMPT,
		input: `Here the user's question:\n${message.message}\nHere the information on you in JSON format:\n${JSON.stringify(npc.attributes)}\nHere the retrieved context:\n${extras.map(c => c.text).join("\n")}`
	});
	
	const questionAnswer = `Question: ${message.message}\nAnswer: ${response.output_text}`;
	await pql.query("INSERT INTO informations(npc_id, text, embedding) VALUES($1, $2, $3)", [
		npc.id, questionAnswer, JSON.stringify((await oai.embeddings.create({
			model: process.env.OPENAI_MODEL_EMBEDDING!,
			input: questionAnswer,
			encoding_format: "float"
		})).data[0].embedding)
	]);

	await pql.release()

	sender.sendMessages({
		messageId: randomUUID(),
		contentType: "application/json",
		subject: "game.event",
		body: {
			clientId: message.clientId,
			type: MessageType.NpcRespond,
			message: response.output_text
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