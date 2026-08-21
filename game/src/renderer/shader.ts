import { gl } from "@/core/renderer";
import basicvert from "@/assets/shaders/basic.vert?raw";
import basicfrag from "@/assets/shaders/basic.frag?raw";

export const shaders: Record<string, WebGLProgram> = {};

export function load(): void {
	const infos: Record<string, [GLenum, string]> = {
		basicvert: [ gl.VERTEX_SHADER, basicvert ],
		basicfrag: [ gl.FRAGMENT_SHADER, basicfrag ]
	};

	const ids: Record<string, WebGLShader> = {};

	const links: Record<string, string[]> = {
		basic: ["basicvert", "basicfrag"]
	};

	for (const name in infos) {
		const info = infos[name];
		const shader = gl.createShader(info[0]);
		if (!shader) throw new Error(`Shader ${name} is not created`);
		gl.shaderSource(shader, info[1]);
		gl.compileShader(shader);
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader)!);
		ids[name] = shader;
	}

	for (const name in links)
	{
		const shader = gl.createProgram();
		for (const key of links[name]) gl.attachShader(shader, ids[key]);
		gl.linkProgram(shader);
		if (!gl.getProgramParameter(shader, gl.LINK_STATUS) || gl.isContextLost()) throw new Error(gl.getProgramInfoLog(shader)!);
		shaders[name] = shader;
	}

	for (const name in ids) gl.deleteShader(ids[name]);
}