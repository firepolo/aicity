import { ProcessErrorArgs, ServiceBusClient, ServiceBusReceivedMessage, ServiceBusReceiver, ServiceBusSender } from "@azure/service-bus";
import { DefaultAzureCredential } from "@azure/identity";
import { randomUUID } from "crypto";
import { Client } from "@/shared/data";

let bus: ServiceBusClient;
let sender: ServiceBusSender;
let receiver: ServiceBusReceiver;

async function onMessage(message: ServiceBusReceivedMessage): Promise<void> {
	console.log(message.applicationProperties!["clientId"]!);
}

async function onError(error: ProcessErrorArgs): Promise<void> {
	console.error(error);
}

export type EventMessage = {
	subscription: string,
	type?: string,
	body?: any
};

export default {
	initialize(): void {
		const credential = new DefaultAzureCredential();
		bus = new ServiceBusClient(process.env.SERVICE_BUS_ENDPOINT!, credential);

		sender = bus.createSender(process.env.SERVICE_BUS_TOPIC!, {
			identifier: process.env.APP_NAME
		});
		receiver = bus.createReceiver(process.env.SERVICE_BUS_TOPIC!, "game.server", {
			identifier: process.env.APP_NAME
		});

		receiver.subscribe({
			processMessage: onMessage,
			processError: onError
		})
	},

	async shutdown(): Promise<void> {
		if (receiver) await receiver.close();
		if (sender) await sender.close();
		if (bus) await bus.close();
	},

	async send(client: Client, messages: EventMessage[]): Promise<void> {
		try {
			await sender.sendMessages(messages.map((message) => ({
				messageId: randomUUID(),
				contentType: "application/json",
				subject: message.subscription,
				applicationProperties: {
					clientId: client.uuid,
					type: message.type
				},
				body: message.body
			})));
		}
		catch (ex) {
			console.error(ex);
		}
	}
}