import { ProcessErrorArgs, ServiceBusClient, ServiceBusReceivedMessage, ServiceBusReceiver, ServiceBusSender } from "@azure/service-bus";
import { DefaultAzureCredential } from "@azure/identity";
import { randomUUID, UUID } from "crypto";
import { MessageType } from "@game/shared/network";
import { sockets } from "@/shared/data";

export type EventMessage = { clientId: UUID };
export type ResponseEventMessage = { clientId: UUID, type: MessageType };

let bus: ServiceBusClient;
let sender: ServiceBusSender;
let receiver: ServiceBusReceiver;

async function onMessage(receivedMessage: ServiceBusReceivedMessage): Promise<void> {
	const message: ResponseEventMessage = receivedMessage.body;
	if (!sockets.has(message.clientId)) return;

	const socket = sockets.get(message.clientId)!;

	switch (message.type) {
		case MessageType.NpcGenerated: {
			console.log("Received GenerateNpc from azure function");
			const buffer = new ArrayBuffer(1);
			const view = new DataView(buffer);
			view.setUint8(0, MessageType.NpcGenerated);
			socket.send(buffer);
			break;
		}
	}
}

async function onError(error: ProcessErrorArgs): Promise<void> {
	console.error("Error from service bus", error);
}

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

	async send<T extends EventMessage>(subscription: string, message: T): Promise<void> {
		try {
			await sender.sendMessages({
				messageId: randomUUID(),
				contentType: "application/json",
				subject: subscription,
				body: message
			});
		}
		catch (ex) {
			console.error(ex);
		}
	}
}