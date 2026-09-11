import { Entity } from "./entity";
import { Vec3 } from "@/math/vec3";

export class Collidable extends Entity {
	readonly velocity: Vec3 = new Vec3(0.0, 0.0, 0.0);
	hitbox: number = 0.0;

	constructor(hitbox: number) {
		super();
		this.hitbox = hitbox;
	}
}