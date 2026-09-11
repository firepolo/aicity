export class Vec2 {
	x: number;
	y: number;

	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}

	set(x: number, y: number) {
		this.x = x;
		this.y = y;
	}

	setNormalize(v: Vec2): void {
		const l = Math.sqrt(v.x * v.x + v.y * v.y);
		this.x = v.x / l;
		this.y = v.y / l;
	}

	length(): number {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}
}