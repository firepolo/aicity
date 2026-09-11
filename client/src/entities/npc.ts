import { gl } from "@/core/renderer";
import { Entity } from "./entity";
import { shaders } from "@/renderer/shader";
import { Vec2 } from "@/math/vec2";

export class Npc extends Entity {
	private readonly id: number;
	private readonly hair: number;
	private readonly eye: number;
	readonly speed: number;
	readonly look: Vec2 = new Vec2(0.0, 1.0);
	readonly waypoint: Vec2 = new Vec2(0.0, 0.0);
	readonly direction: Vec2 = new Vec2(0.0, 0.0);
	readonly texture: WebGLTexture;
	prevIndex : number = -1;
	distance: number = 0.0;
	time: number = 0.0;

	constructor(id: number, hair: number, eye: number, texture: WebGLTexture) {
		super();
		this.id = id;
		this.hair = hair;
		this.eye = eye;
		this.texture = texture;
		this.speed = 5.0 + (Math.random() * 10.0);
	}

	render(): void {
		gl.bindTexture(gl.TEXTURE_2D, this.texture);
		gl.uniform3f(shaders.npc.uniforms.uPosition, this.position.x, this.position.y, this.position.z);
		gl.uniform2f(shaders.npc.uniforms.uLook, this.look.x, this.look.y);
	}
}