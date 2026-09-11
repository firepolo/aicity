import { gl } from "@/core/renderer";
import { Player } from "@/entities/player";
import camera from "@/core/camera";
import { shaders } from "@/renderer/shader";
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

	gl.clearColor(0, 0, 0, 1);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	shaders.cell.use();
	gl.uniformMatrix4fv(shaders.cell.uniforms.uView, false, camera.transform);
	level.renderCells();
	
	shaders.npc.use();
	gl.uniformMatrix4fv(shaders.npc.uniforms.uView, false, camera.transform);
	gl.uniform2f(shaders.npc.uniforms.uCamera, camera.position.x, camera.position.z);
	level.renderNpc();
	
	requestAnimationFrame(onTick);
}

export default {
	initialize(): void {
		level.initialize(player);
	},

	start(): void {
		player.updateCamera();

		window.dispatchEvent(new Event("resize"));
		requestAnimationFrame(onTick);
	}
}