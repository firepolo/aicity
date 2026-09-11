import renderer from "@/core/renderer";
import { Player } from "@/entities/player";
import level from "./level";

const player: Player = new Player();

let lastTime: number;

function onTick(now: number): void {
	const elapsedTime = (now - lastTime) * 0.001;
	lastTime = now;

	player.input(elapsedTime);

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