import { shaders } from "@/renderer/shader";
import { Mat4 } from "@/math/mat4";
import level from "./level";
import camera from "./camera";

export let gl!: WebGL2RenderingContext;

let cameraBuffer: WebGLBuffer;

function onContextLost(e: Event): void {
	e.preventDefault();
}

function onContextRestored(e: Event): void {
	e.preventDefault();
}

function onContextResize(e: Event): void {
	const w = window.innerWidth;
	const h = window.innerHeight;

	gl.bufferSubData(gl.UNIFORM_BUFFER, 0, Mat4.perspective(70, w / h, 0.01, 1000.0));
}

export default {
	initialize(): void {
		const width = 320;
		const height = 180;

		const canvas = document.createElement("canvas");
		canvas.width = width;
		canvas.height = height;
		canvas.style.position = "fixed";
		canvas.style.inset = "0";
		canvas.style.width = "100vw";
		canvas.style.height = "100vh";
		canvas.style.zIndex = "0";
		canvas.style.imageRendering = "pixelated";
		document.body.appendChild(canvas);

		const context = canvas.getContext("webgl2", {
    		alpha: false,
    		antialias: false,
    		depth: true,
			premultipliedAlpha: false,
			stencil: false,
    		xrCompatible: false
		});
		if (!context) throw new Error("WebGL is not supported");

		gl = context;

		gl.enable(gl.DEPTH_TEST);
		gl.enable(gl.CULL_FACE);
		gl.viewport(0, 0, width, height);
		gl.activeTexture(gl.TEXTURE0);

		cameraBuffer = gl.createBuffer();
		gl.bindBuffer(gl.UNIFORM_BUFFER, cameraBuffer);
		gl.bufferData(gl.UNIFORM_BUFFER, 16 * 4 * 2, gl.DYNAMIC_DRAW);

		canvas.addEventListener('webglcontextlost', onContextLost, false);
		canvas.addEventListener('webglcontextrestored', onContextRestored, false);
		window.addEventListener('resize', onContextResize, false);
	},

	postInitialize(): void {
		gl.uniformBlockBinding(shaders.cell.id, 0, 0);
		gl.bindBufferBase(gl.UNIFORM_BUFFER, 0, cameraBuffer);
	},

	render(): void {
		gl.clearColor(0, 0, 0, 1);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		gl.bufferSubData(gl.UNIFORM_BUFFER, 64, camera.transform);

		shaders.cell.use();
		level.renderCells();
	
		shaders.npc.use();
		gl.uniform2f(shaders.npc.uniforms.uCamera, camera.position.x, camera.position.z);
		level.renderNpc();
	}
}