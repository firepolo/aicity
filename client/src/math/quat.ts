import { Mat4 } from "./mat4";

export class Quat {
	static ZERO = new Quat(0.0, 0.0, 0.0, 0.0);

	x: number;
	y: number;
	z: number;
	w: number;

	constructor(x: number, y: number, z: number, w: number) {
		this.x = x;
		this.y = y;
		this.z = z;
		this.w = w;
	}

	set(x: number, y: number, z: number, w: number) {
		this.x = x;
		this.y = y;
		this.z = z;
		this.w = w;
	}

	static fromAngleAxis(x: number, y: number, z: number, angle: number) {
		angle *= 0.5;
		const sin = Math.sin(angle);
		return new Quat(x * sin, y * sin, z * sin, Math.cos(angle));
	}

	static toMat4(q: Quat): Mat4 {
		const xx = q.x * q.x;
		const xy = q.x * q.y;
		const xz = q.x * q.z;
		const xw = q.x * q.w;
		const yy = q.y * q.y;
		const yz = q.y * q.z;
		const yw = q.y * q.w;
		const zz = q.z * q.z;
		const zw = q.z * q.w;
		return new Mat4([
			1.0 - 2.0 * (yy + zz), 2.0 * (xy - zw), 2.0 * (xz + yw), 0.0,
			2.0 * (xy + zw), 1.0 - 2.0 * (xx + zz), 2.0 * (yz - xw), 0.0,
			2.0 * (xz - yw), 2.0 * (yz + xw), 1.0 - 2.0 * (xx + yy), 0.0,
			0.0, 0.0, 0.0, 1.0
		]);
	}

	static mul(a: Quat, b: Quat): Quat {
		return new Quat(
			a.x * b.x - a.y * b.y - a.z * b.z - a.w * b.w,
			a.x * b.y + a.y * b.x - a.z * b.w + a.w * b.z,
			a.x * b.z + a.y * b.w + a.z * b.x - a.w * b.y,
			a.x * b.w - a.y * b.z + a.z * b.y + a.w * b.x
		);
	}
};