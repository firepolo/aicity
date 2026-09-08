import { Vec3 } from "@/math/vec3";
import { keys, mouse, mouseLocked } from "@/core/input";
import camera from "@/core/camera";
import { Entity } from "./entity";

const MoveSpeed = 30.0;

export class Player extends Entity {
	readonly position: Vec3 = new Vec3(0.0, 0.0, 0.0);
	readonly direction: Vec3 = new Vec3(0.0, 0.0, -1.0);
	private readonly headOffset: Vec3 = new Vec3(0.0, 10, 0.0);
	private readonly head: Vec3 = new Vec3(0.0, 10, 0.0);

	constructor() {
		super(2.5);
	}

	updateCamera(): void {
		this.head.set(Vec3.add(this.position, this.headOffset));
		camera.update(this.head, this.direction);
	}

	input(elapsedTime: number): void {
		if (mouseLocked) {
			if (mouse.x != 0) {
				camera.yaw += mouse.x * elapsedTime * 0.2;
				this.direction.setXYZ(Math.sin(camera.yaw), 0.0, -Math.cos(camera.yaw));
				mouse.x = 0;
			}
			if (mouse.y != 0) {
				camera.pitch -= mouse.y * elapsedTime * 0.2;
				mouse.y = 0;
			}
		}

		if (keys["KeyW"]) {
			this.velocity.x += this.direction.x * elapsedTime * MoveSpeed;
			this.velocity.z += this.direction.z * elapsedTime * MoveSpeed;
		}
		else if (keys["KeyS"]) {
			this.velocity.x += -this.direction.x * elapsedTime * MoveSpeed;
			this.velocity.z += -this.direction.z * elapsedTime * MoveSpeed;
		}

		if (keys["KeyA"]) {
			this.velocity.x += this.direction.z * elapsedTime * MoveSpeed;
			this.velocity.z += -this.direction.x * elapsedTime * MoveSpeed;
		}
		else if (keys["KeyD"]) {
			this.velocity.x += -this.direction.z * elapsedTime * MoveSpeed;
			this.velocity.z += this.direction.x * elapsedTime * MoveSpeed;
		}
	}

	update(): void {
		this.position.x += this.velocity.x;
		this.position.z += this.velocity.z;
		this.velocity.clear();
		this.updateCamera();
	}
}