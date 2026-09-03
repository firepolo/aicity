import { gl } from "@/core/renderer";
import { ProgressCallback } from "@/core/loader"
import basicvert from "@/assets/shaders/basic.vs";
import basicfrag from "@/assets/shaders/basic.fs";

export class Shader {
	private readonly id: WebGLProgram;
	public readonly uniforms: Record<string, WebGLUniformLocation>;

	constructor(id: WebGLProgram, uniforms: Record<string, WebGLUniformLocation>) {
		this.id = id;
		this.uniforms = uniforms;
	}

	use() {
		gl.useProgram(this.id);
	}
}

export const shaders: Record<string, Shader> = {};

export default {
	async load(callback: ProgressCallback): Promise<void> {
		const urls: Record<string, string> = {
			basicvert,
			basicfrag
		};

		const ids: Record<string, WebGLShader> = {};

		type ShaderInfo = { shaders: string[], uniforms: string[] };
		const infos: Record<string, ShaderInfo> = {
			basic: {
				shaders: [ "basicvert", "basicfrag" ],
				uniforms: [ "uModel", "uView", "uProjection", "uSampler", "uColor" ]
			}
		};

		const getShaderType = (ext: string): GLenum => {
			if (ext == "vs") return gl.VERTEX_SHADER;
			if (ext == "fs") return gl.FRAGMENT_SHADER;
			return 0;
		};

		for (const name in urls) {
			const url = urls[name];
			callback(url);
			try {
				const source = (await (await fetch(url)).text());
				const type: GLenum = getShaderType(url.split("?")[0].slice(-2));
				if (!type) throw new Error(`shader type "${type}" is not supported`);
				const shader = gl.createShader(type);
				if (!shader) throw new Error(`Shader ${name} is not created`);
				gl.shaderSource(shader, source);
				gl.compileShader(shader);
				if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader)!);
				ids[name] = shader;
			}
			catch (ex) {
				throw ex;
			}
		}

		for (const name in infos)
		{
			const info = infos[name];
			const shader = gl.createProgram();
			for (const name of info.shaders) gl.attachShader(shader, ids[name]);
			gl.linkProgram(shader);
			if (!gl.getProgramParameter(shader, gl.LINK_STATUS) || gl.isContextLost()) throw new Error(gl.getProgramInfoLog(shader)!);

			gl.useProgram(shader);
			const uniforms: Record<string, WebGLUniformLocation> = {};
			for (const name of info.uniforms) uniforms[name] = gl.getUniformLocation(shader, name)!;
			shaders[name] = new Shader(shader, uniforms);
		}

		for (const name in ids) gl.deleteShader(ids[name]);
	}
}