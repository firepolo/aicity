import renderer from "@/core/renderer";
import { Player } from "@/entities/player";

const player: Player = new Player();

let lastTime: number;

function onTick(now: number): void {
	const elapsedTime = (now - lastTime) * 0.001;

	player.input(elapsedTime);

	renderer.render();
	
	lastTime = performance.now();
	requestAnimationFrame(onTick);
}

export default {
	initialize(): void {
	},

	start(): void {
		player.updateCamera();

		window.dispatchEvent(new Event("resize"));
		requestAnimationFrame(onTick);
	}
}