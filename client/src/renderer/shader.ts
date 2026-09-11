import { gl } from "@/core/renderer";
import { ProgressCallback } from "@/core/loader"
import cellvs from "@/assets/shaders/cell.vs";
import cellfs from "@/assets/shaders/cell.fs";
import npcvs from "@/assets/shaders/npc.vs";
import npcfs from "@/assets/shaders/npc.fs";

export class Shader {
	readonly id: WebGLProgram;
	readonly uniforms: Record<string, WebGLUniformLocation>;

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
			cellvs,
			cellfs,
			npcvs,
			npcfs
		};

		const links: Record<string, string[]> = {
			cell: [ "cellvs", "cellfs" ],
			npc: [ "npcvs", "npcfs" ]
		};

		const ids: Record<string, WebGLShader> = {};

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

		for (const name in links)
		{
			const link = links[name];
			const shader = gl.createProgram();
			for (const name of link) gl.attachShader(shader, ids[name]);
			gl.linkProgram(shader);
			if (!gl.getProgramParameter(shader, gl.LINK_STATUS) || gl.isContextLost()) throw new Error(gl.getProgramInfoLog(shader)!);

			const uniforms: Record<string, WebGLUniformLocation> = {};
			const count = gl.getProgramParameter(shader, gl.ACTIVE_UNIFORMS);
			for (let i = 0; i < count; ++i) {
				const uniform = gl.getActiveUniform(shader, i)!;
				uniforms[uniform.name] = gl.getUniformLocation(shader, uniform.name)!;
			}
			shaders[name] = new Shader(shader, uniforms);
		}

		for (const name in ids) gl.deleteShader(ids[name]);
	}
}