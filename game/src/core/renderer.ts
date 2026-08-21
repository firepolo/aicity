export let gl!: WebGLRenderingContext;

class Renderer {
	initialize() {
		const canvas = document.createElement("canvas");
		canvas.width = 160;
		canvas.height = 90;
		canvas.style.position = "fixed";
		canvas.style.inset = "0";
		canvas.style.width = "100vw";
		canvas.style.height = "100vh";
		document.body.appendChild(canvas);

		const context = canvas.getContext("webgl", {
    		alpha: false,
    		antialias: false,
    		depth: true,
			premultipliedAlpha: false,
			stencil: false,
    		xrCompatible: false
		});
		if (!context) throw new Error("WebGL is not supported");

		gl = context;

		canvas.addEventListener('webglcontextlost', this.onContextLost, false);
		canvas.addEventListener('webglcontextrestored', this.onContextRestored, false);
		window.addEventListener('resize', this.onContextResize, false);
	}

	render() {
		gl.clearColor(0.5, 0, 0, 1);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	}

	private onContextLost = (e: Event) => {
		e.preventDefault();
	}

	private onContextRestored = (e: Event) => {
		e.preventDefault();
	}

	private onContextResize = (e: Event) => {
		const w = window.innerWidth;
		const h = window.innerHeight;
		gl.viewport(0, 0, w, h);

		//program.setUniformMatrix(uniforms.projection, Mat4.perspective(70, w / h, 0.01, 100));
	}
}

export default new Renderer();