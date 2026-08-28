import "dotenv/config";
import { ServiceBusClient } from "@azure/service-bus";
import { DefaultAzureCredential } from "@azure/identity";
import { randomUUID, UUID } from "crypto";

const client: { uuid: UUID } = { uuid: randomUUID() };

const credential = new DefaultAzureCredential();
const bus = new ServiceBusClient(process.env.SERVICE_BUS_ENDPOINT!, credential);
const sender = bus.createSender(process.env.SERVICE_BUS_TOPIC!, {
	identifier: client.uuid
});

try {
	await sender.sendMessages({
		messageId: randomUUID(),
		contentType: "application/json",
		subject: "level.generator",
		applicationProperties: {
			clientId: client.uuid,
			type: "level.generate"
		},
		body: {
			hello: "world"
		}
	});
	console.log("Sent");
}
catch (ex) {
	console.error(ex);
}

await sender.close();
await bus.close();