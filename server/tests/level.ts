import "dotenv/config";
import { ServiceBusClient } from "@azure/service-bus";
import { DefaultAzureCredential } from "@azure/identity";
import { randomUUID, UUID } from "crypto";

const client: { uuid: UUID } = { uuid: randomUUID() };

const credential = new DefaultAzureCredential();
const bus = new ServiceBusClient(process.env.SERVICE_BUS_ENDPOINT!, credential);
const sender = bus.createSender("generation", {
	identifier: client.uuid
});

try {
	await sender.sendMessages({
		messageId: randomUUID(),
		contentType: "application/json",
		applicationProperties: {
			clientId: client.uuid
		},
		body: {
			hello: "world"
		}
	});
}
catch (ex) {
	console.error(ex);
}