export class Vec3 {
	static ZERO: Vec3 = new Vec3(0.0, 0.0, 0.0);
	static UP: Vec3 = new Vec3(0.0, 1.0, 0.0);

	x: number;
	y: number;
	z: number;

	constructor(x: number, y: number, z: number) {
		this.x = x;
		this.y = y;
		this.z = z;
	}

	set(v: Vec3) {
		this.x = v.x;
		this.y = v.y;
		this.z = v.z;
	}

	setXYZ(x: number, y: number, z: number) {
		this.x = x;
		this.y = y;
		this.z = z;
	}

	static add(a: Vec3, b: Vec3): Vec3 {
		return new Vec3(a.x + b.x, a.y + b.y, a.z + b.z);
	}

	static sub(a: Vec3, b: Vec3): Vec3 {
		return new Vec3(a.x - b.x, a.y - b.y, a.z - b.z);
	}

	static mul(a: Vec3, b: Vec3): Vec3 {
		return new Vec3(a.x * b.x, a.y * b.y, a.z * b.z);
	}

	static div(a: Vec3, b: Vec3): Vec3 {
		return new Vec3(a.x / b.x, a.y / b.y, a.z / b.z);
	}

	static muls(v: Vec3, s: number): Vec3 {
		return new Vec3(v.x * s, v.y * s, v.z * s);
	}

	static inverse(v: Vec3): Vec3 {
		return new Vec3(-v.x, -v.y, -v.z);
	}

	static normal(v: Vec3): Vec3 {
		return new Vec3(-v.z, v.x, v.y);
	}

	static lengthSquared(v: Vec3): number {
		return v.x * v.x + v.y * v.y + v.z * v.z;
	}

	static length(v: Vec3): number {
		return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
	}

	static normalize(v: Vec3): Vec3 {
		const l = Vec3.length(v);
		return new Vec3(v.x / l, v.y / l, v.z / l);
	}

	static dot(a: Vec3, b: Vec3): number {
		return a.x * b.x + a.y * b.y + a.z * b.z;
	}

	static cross(a: Vec3, b: Vec3): Vec3 {
		return new Vec3(
			a.y * b.z - a.z * b.y,
			a.z * b.x - a.x * b.z,
			a.x * b.y - a.y * b.x
		);
	}
};
