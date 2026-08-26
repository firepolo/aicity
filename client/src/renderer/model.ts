import { Vec2 } from "@/math/vec2";
import { Vec3 } from "@/math/vec3";
import { ProgressCallback } from "@/core/booter"

import { gl } from "@/core/renderer"
import building001 from "@/assets/models/building.001.obj"
import building002 from "@/assets/models/building.002.obj"
import building003 from "@/assets/models/building.003.obj"
import building004 from "@/assets/models/building.004.obj"
import building005 from "@/assets/models/building.005.obj"

class Model {
	private readonly vba: WebGLVertexArrayObject;
	private readonly count: number;

	constructor(vba: WebGLVertexArrayObject, count: number) {
		this.vba = vba;
		this.count = count;
	}

	render() {
		gl.bindVertexArray(this.vba);
		gl.drawArrays(gl.TRIANGLES, 0, this.count);
	}
}

export const models: Record<string, Model> = {};

export default {
	async load(callback: ProgressCallback): Promise<void> {
		const urls: Record<string, string> = {
			building001,
			building002,
			building003,
			building004,
			building005
		};

		for (const name in urls) {
			const url = urls[name];
			callback(url);
			const source = (await (await fetch(url)).text());
			const lines: string[] = source.split("\n");
			const vertices: Vec3[] = [];
			const normals: Vec3[] = [];
			const texCoords: Vec2[] = [];
			const buffer: number[] = [];

			for (const line of lines) {
				const values = line.split(" ");
				if (values.length < 3) continue;
				if (values[0] == "v") vertices.push(new Vec3(parseFloat(values[1]), parseFloat(values[2]), parseFloat(values[3])));
				else if (values[0] == "vn") normals.push(new Vec3(parseFloat(values[1]), parseFloat(values[2]), parseFloat(values[3])));
				else if (values[0] == "vt") texCoords.push(new Vec2(parseFloat(values[1]), parseFloat(values[2])));
				else if (values[0] == "f") {
					for (let i = 1; i < values.length; ++i) {
						const attributes = values[i].split("/");
						const v = vertices[parseInt(attributes[0]) - 1];
						const t = texCoords[parseInt(attributes[1]) - 1];
						const n = normals[parseInt(attributes[2]) - 1];
						buffer.push(v.x);
						buffer.push(v.y);
						buffer.push(v.z);
						buffer.push(t.x);
						buffer.push(t.y);
						buffer.push(n.x);
						buffer.push(n.y);
						buffer.push(n.z);
					}
				}
			}

			const count = buffer.length / 8;
			const vba = gl.createVertexArray();
			const vbo = gl.createBuffer();
			gl.bindVertexArray(vba);
			gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(buffer), gl.STATIC_DRAW);
			gl.enableVertexAttribArray(0);
			gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 32, 0);
			gl.enableVertexAttribArray(1);
			gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 32, 12);
			gl.enableVertexAttribArray(2);
			gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 32, 20);

			models[name] = new Model(vba, count);
		}
	}
}