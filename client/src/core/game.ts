import renderer from "@/core/renderer";
import level from "./level";
import { keys } from "./input";
import { Player } from "@/entities/player";
import chatbox from "@/ui/chatbox";

const player: Player = new Player();

let lastTime: number;

function onTick(now: number): void {
	const elapsedTime = (now - lastTime) * 0.001;
	lastTime = now;

	if (!chatbox.visible) {
		player.input(elapsedTime);

		if (keys["KeyE"]) {
			const npc = level.callNpc();
			if (npc) chatbox.show(npc);
		}
	}

	level.collision(player);
	player.update();

	level.update(elapsedTime);
	
	renderer.render();
	
	requestAnimationFrame(onTick);
}

export default {
	initialize(): void {
		level.initialize(player);

		lastTime = performance.now();
	},

	start(): void {
		player.updateCamera();

		window.dispatchEvent(new Event("resize"));
		requestAnimationFrame(onTick);
	}
}