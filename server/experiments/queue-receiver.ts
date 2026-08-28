import "dotenv/config";
import { delay, ProcessErrorArgs, ServiceBusClient, ServiceBusReceivedMessage } from "@azure/service-bus";
import { DefaultAzureCredential } from "@azure/identity";
import { randomUUID, UUID } from "crypto";

const client: { uuid: UUID } = { uuid: randomUUID() };

const credential = new DefaultAzureCredential();
const bus = new ServiceBusClient(process.env.SERVICE_BUS_ENDPOINT!, credential);
const receiver = bus.createReceiver(process.env.SERVICE_BUS_TOPIC!, "level.generator", {
	identifier: client.uuid
})

async function onMessage(message: ServiceBusReceivedMessage): Promise<void> {
	console.log(message.applicationProperties!["clientId"]!);
}

async function onError(error: ProcessErrorArgs): Promise<void> {
	console.error(error);
}

receiver.subscribe({
	processMessage: onMessage,
	processError: onError
})

await delay(10000);

await receiver.close();
await bus.close();