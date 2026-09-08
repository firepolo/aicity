import { Mat4 } from "@/math/mat4";
import { Model } from "./model";
import { gl } from "@/core/renderer";
import { shaders } from "./shader";

export class ModelInstance {
	private readonly model: Model;
	private readonly texture: WebGLTexture;
	private readonly transform: Mat4;

	constructor(model: Model, texture: WebGLTexture, transform: Mat4) {
		this.model = model;
		this.texture = texture;
		this.transform = transform;
	}

	render(): void {
		gl.bindTexture(gl.TEXTURE_2D, this.texture);
		gl.uniformMatrix4fv(shaders.basic.uniforms.uModel, false, this.transform);
		this.model.render();
	}
}