import camera from "@/core/camera";
import input from "@/core/input";
import network from "@/core/network";
import { Npc } from "@/entities/npc";
import { Vec2 } from "@/math/vec2";
import { MessageType } from "@game/shared/network";

const chatbox = document.getElementById("chatbox")!;
const chatboxInput = document.getElementById("chatbox-input")!;
const chatboxExit = document.getElementById("chatbox-exit")!;
const look: Vec2 = new Vec2(0, 0);

let visible = false;
let npc: Npc | null = null;

function onKeyEvent(e: KeyboardEvent): void {
	if (!e.shiftKey && e.code == "Enter") {
		e.preventDefault();
		
		const encoded = new TextEncoder().encode(chatboxInput.value);
		const packet = new ArrayBuffer(encoded.byteLength + 5);
		const view = new DataView(packet);
		view.setUint8(0, MessageType.ChatNpc);
		view.setUint32(1, npc!.id);
		for (let i = 0; i < encoded.byteLength; ++i) view.setUint8(5 + i, encoded[i]);
		network.send(packet);
	}
}

function hide(): void {
	npc!.look.set(look.x, look.y);
	npc!.inChat = false;
	visible = false;
	chatbox.classList.add("hidden");
	input.clear();
	input.lockMouse();
}

export default {
	get visible() {
		return visible;
	},

	initialize(): void {
		network.on(MessageType.NpcRespond, )

		chatboxInput.addEventListener("keydown", onKeyEvent);
		chatboxExit.addEventListener("click", hide);
		chatbox.classList.add("hidden");
	},

	show(target: Npc): void {
		npc = target;
		npc.inChat = true;
		look.set(npc.look.x, npc.look.y);
		npc.look.set(-Math.sin(camera.yaw), Math.cos(camera.yaw));

		input.unLockMouse()
		chatboxInput.value = "";
		chatbox.classList.remove("hidden");
		chatboxInput.focus({
			focusVisible: true
		});
		visible = true;
	}
}