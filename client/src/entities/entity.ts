import { Vec3 } from "@/math/vec3";

export class Entity {
	readonly position: Vec3 = new Vec3(0.0, 0.0, 0.0);
	readonly velocity: Vec3 = new Vec3(0.0, 0.0, 0.0);
	hitbox: number = 0.0;

	constructor(hitbox: number) {
		this.hitbox = hitbox;
	}
}