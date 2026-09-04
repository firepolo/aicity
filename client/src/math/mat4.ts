import { Vec3 } from "./vec3";

export class Mat4 extends Float32Array {
	selfLookAt(eye: Vec3, center: Vec3, up: Vec3): void {
		const z = Vec3.normalize(Vec3.sub(eye, center));
		const x = Vec3.normalize(Vec3.cross(up, z));
		const y = Vec3.normalize(Vec3.cross(z, x));
		this[0] = x.x; this[1] = y.x; this[2] = z.x; this[3] = 0.0;
		this[4] = x.y; this[5] = y.y; this[6] = z.y; this[7] = 0.0;
		this[8] = x.z; this[9] = y.z; this[10] = z.z; this[11] = 0.0;
		this[12] = -Vec3.dot(x, eye); this[13] = -Vec3.dot(y, eye); this[14] = -Vec3.dot(z, eye); this[15] = 1.0;
	}

	static identity(): Mat4 {
		return new Mat4([
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1
		]);
	}

	static translate(x: number, y: number, z: number): Mat4 {
		return new Mat4([
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			x, y, z, 1
		]);
	}

	static rotateY(angle: number): Mat4 {
		const c = Math.cos(angle);
		const s = Math.sin(angle);
		return new Mat4([
			c, 0, -s, 0,
			0, 1, 0, 0,
			s, 0, c, 0,
			0, 0, 0, 1
		]);
	}

	static perspective(fov: number, aspect: number, near: number, far: number): Mat4 {
		const d = near - far;
		const f = 1 / Math.tan(Math.PI / 180 * fov * 0.5);
		return new Mat4([
			f / aspect, 0, 0, 0,
			0, f, 0, 0,
			0, 0, (near + far) / d, -1,
			0, 0, (2 * near * far) / d, 0
		]);
	}

	static lookAt(eye: Vec3, center: Vec3, up: Vec3): Mat4 {
		const z = Vec3.normalize(Vec3.sub(eye, center));
		const x = Vec3.normalize(Vec3.cross(up, z));
		const y = Vec3.normalize(Vec3.cross(z, x));
		return new Mat4([
			x.x, y.x, z.x, 0,
			x.y, y.y, z.y, 0,
			x.z, y.z, z.z, 0,
			-Vec3.dot(x, eye), -Vec3.dot(y, eye), -Vec3.dot(z, eye), 1,
		]);
	}

	static mul(a: Mat4, b: Mat4): Mat4 {
		return new Mat4([
			a[0] * b[0] + a[1] * b[4] + a[2] * b[8] + a[3] * b[12],
			a[0] * b[1] + a[1] * b[5] + a[2] * b[9] + a[3] * b[13],
			a[0] * b[2] + a[1] * b[6] + a[2] * b[10] + a[3] * b[14],
			a[0] * b[3] + a[1] * b[7] + a[2] * b[11] + a[3] * b[15],

			a[4] * b[0] + a[5] * b[4] + a[6] * b[8] + a[7] * b[12],
			a[4] * b[1] + a[5] * b[5] + a[6] * b[9] + a[7] * b[13],
			a[4] * b[2] + a[5] * b[6] + a[6] * b[10] + a[7] * b[14],
			a[4] * b[3] + a[5] * b[7] + a[6] * b[11] + a[7] * b[15],

			a[8] * b[0] + a[9] * b[4] + a[10] * b[8] + a[11] * b[12],
			a[8] * b[1] + a[9] * b[5] + a[10] * b[9] + a[11] * b[13],
			a[8] * b[2] + a[9] * b[6] + a[10] * b[10] + a[11] * b[14],
			a[8] * b[3] + a[9] * b[7] + a[10] * b[11] + a[11] * b[15],

			a[12] * b[0] + a[13] * b[4] + a[14] * b[8] + a[15] * b[12],
			a[12] * b[1] + a[13] * b[5] + a[14] * b[9] + a[15] * b[13],
			a[12] * b[2] + a[13] * b[6] + a[14] * b[10] + a[15] * b[14],
			a[12] * b[3] + a[13] * b[7] + a[14] * b[11] + a[15] * b[15]
		]);
	}
}