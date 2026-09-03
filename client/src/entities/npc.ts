import { Vec3 } from "@/math/vec3";

export class Npc {
	private position: Vec3 = new Vec3(0.0, 0.0, 0.0);
	private direction: Vec3 = new Vec3(0.0, 0.0, -1.0);

	update(elapsedTime: number) {
	}
}