import { Vec3 } from "@/math/vec3";

export class Npc {
	private position: Vec3 = new Vec3(0.0, 0.0, 0.0);
	private direction: Vec3 = new Vec3(0.0, 0.0, -1.0);

	private readonly id: number;
	private readonly hair: number;
	private readonly eye: number;

	constructor(id: number, hair: number, eye: number) {
		this.id = id;
		this.hair = hair;
		this.eye = eye;
	}

	update(elapsedTime: number) {
	}
}