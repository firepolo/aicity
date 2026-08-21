import { gl } from "../core/renderer"

class Buffer
{
	private vbo: WebGLBuffer;
	private vertexCount: number;

	constructor()
	{
		this.vbo = gl.createBuffer();
		this.vertexCount = 0;
	}

	load(vertices)
	{
		this.vertexCount = vertices.length / 5;
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
		gl.vertexAttribPointer(attributes.position, 3, gl.FLOAT, false, 20, 0);
		gl.vertexAttribPointer(attributes.texCoord, 2, gl.FLOAT, false, 20, 12);
		return true;
	}

	render()
	{
		gl.enableVertexAttribArray(attributes.position);
		gl.enableVertexAttribArray(attributes.texCoord);
		gl.drawArrays(gl.TRIANGLES, 0, this.vertexCount);
		gl.disableVertexAttribArray(attributes.texCoord);
		gl.disableVertexAttribArray(attributes.position);
	}
}