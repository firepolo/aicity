import { gl } from "@/core/renderer";
import { Player } from "@/entities/player";
import { transform as camera } from "@/core/camera";
import { shaders } from "@/renderer/shader";
import level from "./level";

const player: Player = new Player();

let lastTime: number;

function onTick(now: number): void {
	const elapsedTime = (now - lastTime) * 0.001;

	player.input(elapsedTime);

	level.collision(player);

	player.update();

	gl.clearColor(0, 0, 0, 1);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	shaders.basic.use();
	gl.uniformMatrix4fv(shaders.basic.uniforms.uView, false, camera);
		
	level.render(player.position);
	
	lastTime = performance.now();
	requestAnimationFrame(onTick);
}

export default {
	initialize(): void {
		level.spawn(player);
	},

	start(): void {
		player.updateCamera();

		window.dispatchEvent(new Event("resize"));
		requestAnimationFrame(onTick);
	}
}