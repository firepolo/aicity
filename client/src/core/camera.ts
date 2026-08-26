import { Vec3 } from "@/math/vec3";
import { Mat4 } from "@/math/mat4";

let yaw: number = 0.0;
let pitch: number = 0.0;
const look: Vec3 = new Vec3(0.0, 0.0, -1.0);

export const transform: Mat4 = Mat4.identity();

export default {
	get yaw() {
		return yaw;
	},

	get pitch() {
		return pitch;
	},

	set yaw(angle: number) {
		yaw = angle;
	},

	set pitch(angle: number) {
		pitch = Math.min(Math.max(-1.5, angle), 1.5);
	},

	update(position: Vec3, orientation: Vec3) {
		const cos = Math.cos(pitch);
		look.setXYZ(orientation.x * cos, Math.sin(pitch), orientation.z * cos);
		transform.selfLookAt(position, Vec3.add(position, look), Vec3.UP);
	}
}