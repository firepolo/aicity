import { shaders } from "@/renderer/shader";
import { Mat4 } from "@/math/mat4";

export let gl!: WebGL2RenderingContext;

function onContextLost(e: Event): void {
	e.preventDefault();
}

function onContextRestored(e: Event): void {
	e.preventDefault();
}

function onContextResize(e: Event): void {
	const w = window.innerWidth;
	const h = window.innerHeight;

	shaders.cell.use();
	gl.uniformMatrix4fv(shaders.cell.uniforms.uProjection, false, Mat4.perspective(70, w / h, 0.01, 1000.0));
	shaders.npc.use();
	gl.uniformMatrix4fv(shaders.npc.uniforms.uProjection, false, Mat4.perspective(70, w / h, 0.01, 1000.0));
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

		canvas.addEventListener('webglcontextlost', onContextLost, false);
		canvas.addEventListener('webglcontextrestored', onContextRestored, false);
		window.addEventListener('resize', onContextResize, false);
	}
}